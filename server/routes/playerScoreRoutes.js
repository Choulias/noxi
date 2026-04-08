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

// Public (classement visible par tous)
router.get('/slug/:slug', getPlayersScoreBySlug);
router.get('/slugntext/:slug/:text', getPlayersScoreBySlugNText);

// Protégé
router.get('/', authMiddleware, getAllPlayerScores);
router.get('/slugnid/:slug/:playerId', authMiddleware, getPlayerScoreBySlugNId);
router.get('/:id', authMiddleware, getPlayerScoreById);
router.post('/', authMiddleware, createPlayerScore);
router.patch('/:id', authMiddleware, updatePlayerScore);
router.patch('/slugnid/:slug/:playerId', authMiddleware, updatePlayerScoreBySlugNId);
router.delete('/:id', authMiddleware, deletePlayerScore);

export default router;
