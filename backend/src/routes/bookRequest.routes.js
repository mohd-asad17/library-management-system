import express from 'express';

import authenticateUser from '../middleware/auth.middleware';
import authorizeRoles from '../middleware/role.middleware';

import { cancelBookRequestController, createBookRequestController, getMyBookRequestController, getBookRequestByIdController, approveRequestController, rejectRequestController, getAllBookRequestController } from '../controllers/bookRequest.controller';

const router = express.Router();

router.post('/', authenticateUser, authorizeRoles("STUDENT"), createBookRequestController);

router.get('/my', authenticateUser, authorizeRoles("STUDENT"), getMyBookRequestController);

router.get('/:id', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN", "STUDENT"), getBookRequestByIdController);

router.patch('/:id/cancel', authenticateUser, authorizeRoles("STUDENT"), cancelBookRequestController);

// routes to get and see the books requests by the librarian and admin, book requests approve/reject should also be updated by admin , librarian.

router.patch('/:id/approve', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN"), approveRequestController);

router.patch('/:id/reject', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN"), rejectRequestController);

router.get('/', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN"), getAllBookRequestController)

export default router;