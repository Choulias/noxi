import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllGames,
    getPublicGames,
    createGame,
    getGameById,
    getGameByGameId,
    updateGame,
    deleteGame,
    deleteGameId
} from "../controllers/Games.js";

const router = express.Router();

// Public
router.get('/public', getPublicGames);

// Protégé
router.get('/', authMiddleware, getAllGames);
router.get('/:id', authMiddleware, getGameById);
router.get('/gameid/:gameid', authMiddleware, getGameByGameId);
router.post('/', authMiddleware, createGame);
router.patch('/:id', authMiddleware, updateGame);
router.delete('/:id', authMiddleware, deleteGame);
router.delete('/gameid/:gameId', authMiddleware, deleteGameId);

export default router;
