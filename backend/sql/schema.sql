CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT'
        CHECK (role IN ('ADMIN', 'LIBRARIAN', 'STUDENT')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    author VARCHAR(255) NOT NULL,

    isbn VARCHAR(20) UNIQUE,

    category VARCHAR(100),

    publisher VARCHAR(255),

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE book_copies (
    id BIGSERIAL PRIMARY KEY,

    book_id BIGINT NOT NULL,

    accession_number VARCHAR(50) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (
            status IN (
                'AVAILABLE',
                'ISSUED',
                'LOST',
                'DAMAGED',
                'UNAVAILABLE'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_book_copies_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);


CREATE TABLE book_requests (
    id BIGSERIAL PRIMARY KEY,

    student_id BIGINT NOT NULL,

    book_id BIGINT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED',
                'CANCELLED'
            )
        ),

    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    processed_at TIMESTAMPTZ,

    processed_by BIGINT,

    CONSTRAINT fk_book_requests_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book_requests_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book_requests_processed_by
        FOREIGN KEY (processed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


CREATE TABLE book_issues (
    id BIGSERIAL PRIMARY KEY,

    book_copy_id BIGINT NOT NULL,

    student_id BIGINT NOT NULL,

    issued_by BIGINT NOT NULL,

    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    due_date DATE NOT NULL,

    returned_at TIMESTAMPTZ,

    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED'
        CHECK (
            status IN (
                'ISSUED',
                'RETURNED',
                'OVERDUE',
                'LOST'
            )
        ),

    CONSTRAINT fk_book_issues_copy
        FOREIGN KEY (book_copy_id)
        REFERENCES book_copies(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_book_issues_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_book_issues_issued_by
        FOREIGN KEY (issued_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


CREATE INDEX idx_books_title
ON books(title);

CREATE INDEX idx_books_author
ON books(author);

CREATE INDEX idx_book_copies_book_id
ON book_copies(book_id);

CREATE INDEX idx_book_copies_status
ON book_copies(status);

CREATE INDEX idx_book_requests_student_id
ON book_requests(student_id);

CREATE INDEX idx_book_requests_status
ON book_requests(status);

CREATE INDEX idx_book_issues_student_id
ON book_issues(student_id);

CREATE INDEX idx_book_issues_status
ON book_issues(status);


CREATE UNIQUE INDEX unique_pending_book_request
ON book_requests(student_id, book_id)
WHERE status = 'PENDING';


CREATE UNIQUE INDEX unique_active_book_issue
ON book_issues(book_copy_id)
WHERE status IN ('ISSUED', 'OVERDUE');