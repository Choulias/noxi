import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { uploadGameImage } from "../middleware/upload.js";
import {
    getAllGameModels,
    createGameModel,
    getGameModelById,
    getGameModelBySlug,
    updateGameModel,
    deleteGameModel
} from "../controllers/GameModels.js";

const router = express.Router();

// Public
router.get('/', getAllGameModels);
router.get('/:id', getGameModelById);
router.get('/slug/:slug', getGameModelBySlug);

// Admin
router.post('/', authMiddleware, adminMiddleware, uploadGameImage.single('image'), createGameModel);
router.patch('/:id', authMiddleware, adminMiddleware, uploadGameImage.single('image'), updateGameModel);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGameModel);

export default router;
