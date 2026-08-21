import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import bookRouter from './routes/book.routes.js'
import authenticateUser from "./middleware/auth.middleware.js";
import authorizeRoles from "./middleware/role.middleware.js";
import bookCopyRouter from "./routes/bookCopy.routes.js"
import bookRequestRouter from "./routes/bookRequest.routes.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api", bookCopyRouter);
app.use("/api/book-requests", bookRequestRouter);

});


export default app;
