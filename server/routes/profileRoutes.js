import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllProfiles,
    createProfile,
    getProfileById,
    updateProfile,
    deleteProfile
} from "../controllers/Profiles.js";

const router = express.Router();

// Protégé
router.get('/', authMiddleware, getAllProfiles);
router.get('/:id', authMiddleware, getProfileById);
router.post('/', authMiddleware, createProfile);
router.patch('/:id', authMiddleware, updateProfile);
router.delete('/:id', authMiddleware, deleteProfile);

export default router;
