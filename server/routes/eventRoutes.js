import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import {
    getAllEvents,
    getEvents,
    getModelEvents,
    getSpotlightEvent,
    createEvent,
    getEventById,
    updateEvent,
    unspotEvent,
    deleteEvent
} from "../controllers/Events.js";

const router = express.Router();

// Public
router.get('/notspotlight', getEvents);
router.get('/notspotlight/:model', getModelEvents);
router.get('/spotlight', getSpotlightEvent);

// Protégé
router.get('/', authMiddleware, getAllEvents);
router.get('/:id', authMiddleware, getEventById);

// Admin
router.post('/', authMiddleware, adminMiddleware, createEvent);
router.patch('/:id', authMiddleware, adminMiddleware, updateEvent);
router.patch('/unspot/:value', authMiddleware, adminMiddleware, unspotEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

export default router;
