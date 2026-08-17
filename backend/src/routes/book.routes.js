import express from 'express';
import authenticateUser from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import { getBooksController, createBookController,updateBookController, removeBookController, getBookController } from '../controllers/book.controller.js';

const router = express.Router();

router.get('/', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN", "STUDENT"), getBooksController);

router.get('/:id', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN", "STUDENT"), getBookController);

router.post(
    "/",
    authenticateUser,
    authorizeRoles("ADMIN"),
    createBookController
);

router.patch(
    "/:id",
    authenticateUser,
    authorizeRoles("ADMIN"),
    updateBookController
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("ADMIN"),
    removeBookController
);

export default router;