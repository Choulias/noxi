import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllGamePlayers,
    createGamePlayer,
    getGamePlayerById,
    getGamesPlayerByUsername,
    getGamePlayersByGameId,
    updateGamePlayer,
    updateGamePlayerScore,
    deleteGamePlayer,
    deleteGameIdPlayer
} from "../controllers/GamePlayers.js";

const router = express.Router();

// Public (consultation historique de parties)
router.get('/username/:username', getGamesPlayerByUsername);
router.get('/gameid/:gameid', getGamePlayersByGameId);

// Protégé
router.get('/', authMiddleware, getAllGamePlayers);
router.get('/:id', authMiddleware, getGamePlayerById);
router.post('/', authMiddleware, createGamePlayer);
router.patch('/:id', authMiddleware, updateGamePlayer);
router.patch('/score/:gameId/:clientId', authMiddleware, updateGamePlayerScore);
router.delete('/:id', authMiddleware, deleteGamePlayer);
router.delete('/gameid/:gameId', authMiddleware, deleteGameIdPlayer);

export default router;
