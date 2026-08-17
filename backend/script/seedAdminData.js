import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../src/config/db.js';

const seedAdminData = async () => {
    try {
        const {ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD} = process.env;

        if(!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD){
            throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must present in .env");
        }

        const query = {
            text: "SELECT id FROM users WHERE email = $1",
            values: [ADMIN_EMAIL],
        }

        const existingAdminData = await pool.query(query);

        if(existingAdminData.rows.length > 0){
            console.log("Admin account already exists.");
            return;
        }

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await pool.query(
            `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'ADMIN')`,
            [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
        );
        
    } catch(error){
        console.error("Failed to create admin:", error.message);
        process.exitCode = 1;
    } finally {
       await pool.end()
    }
};

seedAdminData();