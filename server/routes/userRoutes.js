import express from "express";
import { authMiddleware, adminMiddleware, verifiedMiddleware } from "../middleware/auth.js";
import {
    getAllUsers,
    getUserById,
    getUserByMail,
    getUserByUsername,
    createUser,
    identifyUser,
    verifyUser,
    updateUser,
    deleteUser
} from "../controllers/Users.js";

const router = express.Router();

// Public
router.post('/', createUser);
router.post('/login', identifyUser);
router.put('/verify-mail/:verificationString', verifyUser);

// Protégé
router.get('/:id', authMiddleware, getUserById);
router.get('/mail/:mail', authMiddleware, getUserByMail);
router.get('/username/:username', authMiddleware, getUserByUsername);
router.patch('/:id', authMiddleware, verifiedMiddleware, updateUser);

// Admin
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
