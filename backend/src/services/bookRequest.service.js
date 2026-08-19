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
            text: `SELECT 1 FROM book_issues bi INNER JOIN book_copies bc ON bc.id = bi.book_copy_id WHERE  bi.student_id = $1 AND bc.book_id AND bi.status IN ('ISSUED', 'OVERDUE') LIMIT 1`,
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
        text: `SELECT br.id, br.student_id, br.book_id, br.status, br.requested_at, br.processed_at, br.processed_by, b.title, b.author, b.isbn FROM book_requests br INNER JOIN books b ON b.id = br.book_id WHERE status = $1 ORDER BY br.requested_at DESC`,
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

export {
    createBookRequests,
    getMyBookRequests,
    getMyBookRequestsById,
    cancelBookRequest
}