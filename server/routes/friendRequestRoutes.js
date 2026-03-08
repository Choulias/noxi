import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllFriendRequests,
    createFriendRequest,
    getFriendRequestById,
    updateFriendRequest,
    deleteFriendRequest
} from "../controllers/FriendRequests.js";

const router = express.Router();

// Protégé
router.get('/', authMiddleware, getAllFriendRequests);
router.get('/:id', authMiddleware, getFriendRequestById);
router.post('/', authMiddleware, createFriendRequest);
router.patch('/:id', authMiddleware, updateFriendRequest);
router.delete('/:id', authMiddleware, deleteFriendRequest);

export default router;
