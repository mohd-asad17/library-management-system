import pool from "../config/db.js";

const createBookCopy = async (bookId, accession_number) => {
    const bookCopyQuery = {
        text: `INSERT INTO book_copies (book_id, accession_number) VALUES ($1, $2) RETURNING id, book_id, accession_number,status, created_at, updated_at`,
        values:[bookId, accession_number]
    };

    const result = await pool.query(bookCopyQuery);
    return result.rows[0];
};


const getBookCopies = async (bookId) => {
    const fetchBookCopiesQuery = {
        text: `SELECT bc.id, bc.book_id, bc.accession_number, bc.status, bc.created_at, bc.updated_at, b.title, b.author, b.isbn FROM book_copies bc INNER JOIN books b ON b.id = bc.book_id WHERE bc.book_id = $1 ORDER BY bc.created_at DESC`,
        values: [bookId]
    };

    const result = await pool.query(fetchBookCopiesQuery);

    return result.rows;
}


const getBookCopyById = async (bookCopyId) => {
    const fetchBookCopyByid = {
        text:  `SELECT bc.id, bc.book_id, bc.accession_number, bc.status, bc.created_at, bc.updated_at, b.title, b.author, b.isbn FROM book_copies bc INNER JOIN books b ON b.id = bc.book_id WHERE bc.id = $1`,
        values: [bookCopyId]
    };

    const result = await pool.query(fetchBookCopyByid);

    return result.rows[0] || null;
};

const updateBookByStatus = async (bookCopyId, status) => {
    const updateBookByStatusQuery = {
        text:`UPDATE book_copies SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, book_id, accession_number, status, created_at, updated_at`,
        values: [status, bookCopyId]
    };

    const result = await pool.query(updateBookByStatusQuery);

    return result.rows[0] || null;
};

const deleteBookCopy =  async (bookCopyId) => {
    const deleteBookQuery = {
        text: `DELETE FROM book_copies WHERE id = $1 RETURNING id, book_id, accession_number`,
        values:[bookCopyId]
    };

    const result = await pool.query(deleteBookQuery);

    return result.rows[0] || null;
}

export {
    createBookCopy,
    getBookCopies,
    getBookCopyById, 
    updateBookByStatus,
    deleteBookCopy
}