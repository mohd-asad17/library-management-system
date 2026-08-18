import pool from "../config/db.js";

const createBook = async ({title, author, isbn, category, publisher, description}) => {
    const createBookQuery = {
        text: "INSERT INTO books (title, author, isbn, category, publisher, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, author, isbn, category, publisher, description, created_at, updated_at",
        values:[title, author, isbn || null, category || null , publisher || null, description || null]
    };
     
    const result = await pool.query(createBookQuery);
    return result.rows[0];
};

const getAllBooks = async () => {
    const getQuery = {
        text: "SELECT b.id, b.title, b.author, b.isbn, b.category, b.publisher, b.description, b.created_at, b.updated_at, COUNT(bc.id)::INTEGER AS total_copies, COUNT(bc.id) FILTER ( WHERE bc.status = 'AVAILABLE' )::INTEGER AS available_copies, COUNT(bc.id) FILTER (  WHERE bc.status IN ('ISSUED', 'LOST', 'DAMAGED', 'UNAVAILABLE')  )::INTEGER AS unavailable_copies FROM books b LEFT JOIN book_copies bc   ON bc.book_id = b.id GROUP BY b.id ORDER BY b.created_at DESC",
    }

    const result = await pool.query(getQuery);
    return result.rows;
};

const getBookById = async (bookId) => {
    const getBookByIdQuery = {
        text:` SELECT
            b.id,
            b.title,
            b.author,
            b.isbn,
            b.category,
            b.publisher,
            b.description,
            b.created_at,
            b.updated_at,
            COUNT(bc.id)::INTEGER AS total_copies,
            COUNT(bc.id) FILTER (
                WHERE bc.status = 'AVAILABLE'
            )::INTEGER AS available_copies
        FROM books b
        LEFT JOIN book_copies bc
            ON bc.book_id = b.id
        WHERE b.id = $1
        GROUP BY b.id `,
        values: [bookId]
    }

    const result = await pool.query(getBookByIdQuery);
    return result.rows[0] || null;
}


const updateBook = async (bookId, fields) => {
    const {title, author, isbn, category, publisher, description} = fields;

    const updateBookQuery = {
        text: `UPDATE books
        SET
            title = COALESCE($1, title),
            author = COALESCE($2, author),
            isbn = COALESCE($3, isbn),
            category = COALESCE($4, category),
            publisher = COALESCE($5, publisher),
            description = COALESCE($6, description),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING
            id,
            title,
            author,
            isbn,
            category,
            publisher,
            description,
            created_at,
            updated_at`,
            values:[title ?? null, author ?? null, isbn ?? null, category ?? null, publisher ?? null, description ?? null, bookId]
    }

    const result = await pool.query(updateBookQuery);

    return result.rows[0] || null;
};

const deleteBook = async (bookId) => {

    const deleteBookQuery = {
        text: `DELETE FROM books WHERE id = $1 RETURNING id, title`,
        values: [bookId]
    };

    const result = await pool.query(deleteBookQuery);
    return result.rows[0] || null;
};

export {
    createBook, 
    getAllBooks, 
    getBookById,
    updateBook,
    deleteBook
}