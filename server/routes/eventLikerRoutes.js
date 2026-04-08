import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllEventLikers,
    createEventLiker,
    getEventLikerById,
    getEventLikersByEventId,
    updateEventLiker,
    deleteEventLiker,
    deleteEventLikerByEventNUser
} from "../controllers/EventLikers.js";

const router = express.Router();

// Protégé
router.get('/', authMiddleware, getAllEventLikers);
router.get('/:id', authMiddleware, getEventLikerById);
router.get('/event/:eventid', getEventLikersByEventId);
router.post('/', authMiddleware, createEventLiker);
router.patch('/:id', authMiddleware, updateEventLiker);
router.delete('/:id', authMiddleware, deleteEventLiker);
router.delete('/dislike/:eventid/:userid', authMiddleware, deleteEventLikerByEventNUser);

export default router;
