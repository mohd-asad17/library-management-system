import pool from "../config/db.js";
import {
    hashPassword,
    comparePassword,
} from "../utils/password.js";

const registerStudent = async ({ name, email, password }) => {

    // Check if user is already regirstered
    const existingQuery = {
        text: "SELECT id FROM users WHERE email = $1",
        values: [email]
    }
    const existingUser = await pool.query(existingQuery);

    if (existingUser.rows.length > 0) {
        throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
        `
        INSERT INTO users (
            name,
            email,
            password_hash,
            role
        )
        VALUES ($1, $2, $3, 'STUDENT')
        RETURNING id, name, email, role, created_at
        `,
        [name, email, passwordHash]
    );

    return result.rows[0];
};

const loginUser = async ({ email, password }) => {
    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            password_hash,
            role
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const isPasswordValid = await comparePassword(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

export { registerStudent, loginUser };