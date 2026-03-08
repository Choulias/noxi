import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllPlayerScores,
    createPlayerScore,
    getPlayerScoreById,
    getPlayersScoreBySlug,
    getPlayerScoreBySlugNId,
    getPlayersScoreBySlugNText,
    updatePlayerScore,
    updatePlayerScoreBySlugNId,
    deletePlayerScore
} from "../controllers/PlayerScores.js";

const router = express.Router();

// Protégé
router.get('/', authMiddleware, getAllPlayerScores);
router.get('/:id', authMiddleware, getPlayerScoreById);
router.get('/slug/:slug', authMiddleware, getPlayersScoreBySlug);
router.get('/slugnid/:slug/:playerId', authMiddleware, getPlayerScoreBySlugNId);
router.get('/slugntext/:slug/:text', authMiddleware, getPlayersScoreBySlugNText);
router.post('/', authMiddleware, createPlayerScore);
router.patch('/:id', authMiddleware, updatePlayerScore);
router.patch('/slugnid/:slug/:playerId', authMiddleware, updatePlayerScoreBySlugNId);
router.delete('/:id', authMiddleware, deletePlayerScore);

export default router;
