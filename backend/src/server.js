import 'dotenv/config';
import app from './app.js';
import pool from './config/db.js';
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await pool.query("SELECT NOW()");

        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);

        process.exit(1);
    }
};

startServer();