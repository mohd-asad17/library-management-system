import express from 'express';
import authenticateUser from '../middleware/auth.middleware';
import authorizeRoles from '../middleware/role.middleware';
import { cancelBookRequestController, createBookRequestController, getMyBookRequestController, getBookRequestByIdController } from '../controllers/bookRequest.controller';
const router = express.Router();

router.post('/', authenticateUser, authorizeRoles("STUDENT"), createBookRequestController);

router.get('/my', authenticateUser, authorizeRoles("STUDENT"), getMyBookRequestController);

router.get('/:id', authenticateUser, authorizeRoles("ADMIN", "LIBRARIAN", "STUDENT"), getBookRequestByIdController);

router.patch('/:id/cancel', authenticateUser, authorizeRoles("STUDENT"), cancelBookRequestController);

export default router;