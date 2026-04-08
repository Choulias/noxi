import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getConversationsList,
    getUnreadCount,
    getConversation,
    sendMessage,
    markAsRead
} from "../controllers/Messages.js";

const router = express.Router();

router.get('/conversations', authMiddleware, getConversationsList);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.get('/:userId', authMiddleware, getConversation);
router.post('/', authMiddleware, sendMessage);
router.patch('/read/:senderId', authMiddleware, markAsRead);

export default router;
