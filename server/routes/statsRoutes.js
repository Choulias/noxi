import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getPlayerStats, setFavoriteGame, recordGameResult } from "../controllers/Stats.js";

const router = express.Router();

// Public (view anyone's stats)
router.get('/:userId', getPlayerStats);

// Protected
router.post('/favorite', authMiddleware, setFavoriteGame);
router.post('/record', authMiddleware, recordGameResult);

export default router;
