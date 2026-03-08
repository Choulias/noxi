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

// Protégé
router.get('/', authMiddleware, getAllGamePlayers);
router.get('/:id', authMiddleware, getGamePlayerById);
router.get('/username/:username', authMiddleware, getGamesPlayerByUsername);
router.get('/gameid/:gameid', authMiddleware, getGamePlayersByGameId);
router.post('/', authMiddleware, createGamePlayer);
router.patch('/:id', authMiddleware, updateGamePlayer);
router.patch('/score/:gameId/:clientId', authMiddleware, updateGamePlayerScore);
router.delete('/:id', authMiddleware, deleteGamePlayer);
router.delete('/gameid/:gameId', authMiddleware, deleteGameIdPlayer);

export default router;
