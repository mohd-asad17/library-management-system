import express from 'express'

import authenticateUser from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';
import { createBookCopyController, getBookCopyByIdController, getBookCopiesController, updateBookCopyByStatusController, removeBookCopyController } from '../controllers/bookCopy.controller.js';


const router = express.Router();


// Copy of book can be created by ADMIN only
router.post('/books/:bookId/copies', authenticateUser, authorizeRoles("ADMIN"), createBookCopyController);


// get all the copies of book
router.get('/books/:bookId/copies',authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN", "STUDENT"), getBookCopiesController);

// get copy of book by ID
router.get('/book-copies/:id', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN", "STUDENT"), getBookCopyByIdController);

// status should be updated by ADMIN, LIBRARIAN only
router.patch('/book-copies/:id/status', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN"), updateBookCopyByStatusController);

// book copy delete by ADMIN only
router.delete('/book-copies/:id', authenticateUser, authorizeRoles("ADMIN"), removeBookCopyController);


export default router; 