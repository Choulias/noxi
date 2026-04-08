import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
    getAllEventAttendees,
    createEventAttendee,
    getEventAttendeeById,
    getEventAttendeesByEventId,
    getEventAttendeeByEventNUser,
    updateEventAttendee,
    deleteEventAttendee,
    deleteEventAttendeeByEventNUser
} from "../controllers/EventAttendees.js";

const router = express.Router();

// Protégé
router.get('/', authMiddleware, getAllEventAttendees);
router.get('/:id', authMiddleware, getEventAttendeeById);
router.get('/event/:eventid', getEventAttendeesByEventId);
router.get('/find/:eventid/:userid', authMiddleware, getEventAttendeeByEventNUser);
router.post('/', authMiddleware, createEventAttendee);
router.patch('/:id', authMiddleware, updateEventAttendee);
router.delete('/:id', authMiddleware, deleteEventAttendee);
router.delete('/withdraw/:eventid/:userid', authMiddleware, deleteEventAttendeeByEventNUser);

export default router;
