import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllFriendships,
    getMyFriendships,
    createFriendship,
    getFriendshipById,
    updateFriendship,
    deleteFriendship
} from "../controllers/Friendships.js";

const router = express.Router();

// Protégé
router.get('/', authMiddleware, getAllFriendships);
router.get('/mine', authMiddleware, getMyFriendships);
router.get('/:id', authMiddleware, getFriendshipById);
router.post('/', authMiddleware, createFriendship);
router.patch('/:id', authMiddleware, updateFriendship);
router.delete('/:id', authMiddleware, deleteFriendship);

export default router;
