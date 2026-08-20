import pool from "../config/db.js";

const createBookRequests = async (studentId, bookId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const bookResultQuery = {
            text: `SELECT b.id, b.title EXISTS (SELECT 1 FROM book_copies bc WHERE bc.book_id = b.id AND bc.status = 'AVAILABLE' ) AS has_available_book_copy FROM books b WHERE b.id = $1`,
            values: [bookId]
        };

        const bookResult = await client.query(bookResultQuery);

        if(bookResult.rows.length === 0 ) {
            throw new Error("BOOK_NOT_FOUND");
        }

        const book = bookResult.rows[0];
        if(!book.has_available_book_copy){
            throw new Error("NO_AVAILABLE_COPY");
        }

        const activeBookIssueQuery = {
            text: `SELECT 1 FROM book_issues bi INNER JOIN book_copies bc ON bc.id = bi.book_copy_id WHERE  bi.student_id = $1 AND bc.book_id = $2 AND bi.status IN ('ISSUED', 'OVERDUE') LIMIT 1`,
            values: [studentId, bookId]
        };

        const activeBookIssue = await client.query(activeBookIssueQuery);

        if(activeBookIssue.rows.length > 0) {
            throw new Error("ALREADY_ISSUED");
        }

        const bookRequestQuery = {
            text: `INSERT INTO book_requests (student_id, book_id ) VALUES ($1, $2) RETURNING id, student_id, book_id, status, requested_at, processed_at, processed_by`, 
            values: [studentId, bookId]
        };

        const bookRequest = await client.query(bookRequestQuery);

        await client.query("COMMIT");

        return bookRequest.rows[0];
    } catch(error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getMyBookRequests = async (studentId) => {
    const fetchBookRequestQuery = {
        text: `SELECT br.id, br.student_id, br.book_id, br.status, br.requested_at, br.processed_at, br.processed_by, b.title, b.author, b.isbn FROM book_requests br INNER JOIN books b ON b.id = br.book_id WHERE br.student_id = $1 ORDER BY br.requested_at DESC`,
        values: [studentId]
    };

    const result = await pool.query(fetchBookRequestQuery);

    return result.rows;
};

const getMyBookRequestsById = async ({requestId, userId, role}) => {

    const fetchBookRequestByIdQuery = {
        text: `SELECT br.id, br.student_id, br.book_id, br.status, br.requested_at, br.processed_at, br.processed_by, b.title, b.author, b.isbn, u.name AS student_name, u.email AS student_email FROM book_requests br INNER JOIN books b ON b.id = br.book_id INNER JOIN users u ON u.id = br.student_id WHERE b.id = $1`,
        values: [requestId]
    }

    const result = await pool.query(fetchBookRequestByIdQuery);

    if(result.rows.length === 0){
        return null;
    }


    const request = result.rows[0];

    if(role === "ADMIN" || role === "LIBRARIAN"){
        return request;
    } 

    if(role === "STUDENT" && Number(request.student_id) === Number(userId)){
        return request;
    }
    return {
        forbidden: true
    };
};

const cancelBookRequest = async (requestId, studentId) => {
    const cancelBookRequestQuery = {
        text: `UPDATE book_requests SET status = 'CANCELLED',  processed_at = CURRENT_TIMESTAMP WHERE id = $1 AND student_id = $2 AND status = 'PENDING' RETURNING id, student_id, book_id, status, requested_at, processed_at, processed_by`,
        values: [requestId, studentId]
    }

    const result = await pool.query(cancelBookRequestQuery);

    return result.rows[0] || null;
};

const getAllBookRequests = async () => {
    const getAllBookRequestsQuery = {
        text: `SELECT br.id, br.student_id, br.book_id, br.status, br.requested_at, br.processed_at, br.processed_by, u.name AS student_name, u.email AS student_email, b.title, b.author, b.isbn FROM book_requests br INNER JOIN users u ON u.id = br.student_id INNER JOIN books b ON b.id = br.book_id ORDER BY requested_at DESC`
    }

    const result = await pool.query(getAllBookRequestsQuery);

    return result.rows;
}

const approveRequest = async (requestId, processedBy) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const  requestResultQuery = {
            text: `SELECT id, student_id, book_id, status FROM book_requests WHERE id = $1 FOR UPDATE `,
            values:[requestId]
        };

        const requestResult = await client.query(requestResultQuery);

        if(requestResult.rows.length === 0){
            throw new Error("REQEUST_NOT_FOUND");
        }

        const request = requestResult.rows[0];

       if(request.status !== "PENDING"){
        throw new Error("REQUEST_NOT_PENDING");
       }

       const availableCopyQuery = {
        text: `SELECT id FROM book_copies WHERE book_id = $1 AND status = 'AVAILABLE' LIMIT 1 FOR UPDATE`,
        values: [request.book_id]
       }

       const availableBookCopyRequest = await client.query(availableCopyQuery);

       if(availableBookCopyRequest.rows.length === 0){
        throw new Error("NO_AVAILABLE_COPY");
       }

      const updateBookStatus = {
        text: `UPDATE book_requests SET status = 'APPROVED', processed_at= CURRENT_TIMESTAMP, processed_by = $1 WHERE id = $2 RETURNING id, student_id, book_id, status, requested_at, processed_at, processed_by`,
        values: [processedBy, requestId]
      }

      const updateResult = await client.query(updateBookStatus);

      await client.query("COMMIT");

      return updateResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}


const rejectRequest = async (requestId, processedBy) => {
    const rejectQuery = {
        text: `UPDATE book_requests SET status = 'REJECTED', processed_at = CURRENT_TIMESTAMP, processed_by = $1 WHERE id = $2 AND status = 'PENDING' RETURNING id, student_id, book_id, status, requested_at, processed_at, processed_by`,
        values: [processedBy, requestId]
    }

    const result = await pool.query(rejectQuery);

    return result.rows[0] || null;
}

export {
    createBookRequests,
    getMyBookRequests,
    getMyBookRequestsById,
    cancelBookRequest,
    getAllBookRequests,
    approveRequest, 
    rejectRequest
}