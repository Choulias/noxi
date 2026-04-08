import express from "express";
import { authMiddleware, adminMiddleware, verifiedMiddleware } from "../middleware/auth.js";
import {
    getAllUsers,
    getUserById,
    getUserByMail,
    getUserByUsername,
    getUserCount,
    getUsersByIds,
    searchUsers,
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
router.get('/count', getUserCount);

// Public (consultation de profil)
router.get('/username/:username', getUserByUsername);

// Protégé
router.post('/batch', authMiddleware, getUsersByIds);
router.get('/search/:query', authMiddleware, searchUsers);
router.get('/:id', authMiddleware, getUserById);
router.get('/mail/:mail', authMiddleware, getUserByMail);
router.patch('/:id', authMiddleware, verifiedMiddleware, updateUser);

// Admin
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
