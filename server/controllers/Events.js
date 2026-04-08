import Event from "../models/eventModel.js";
import { Op } from "sequelize";

export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {
                spotlight: { [Op.not]: 1}
            }
        });
        res.json(events);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getModelEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {
                spotlight: { [Op.not]: 1},
                theme : req.params.model
            }
        });
        res.json(events);
    } catch (error) {
        res.json({ message: error.message });
    }  
}


export const getSpotlightEvent = async (req, res) => {
    try {
        const event = await Event.findAll({
            where: {
                spotlight: 1
            }
        });
        res.json(event[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: "Not found" });
        res.json(event);
    } catch (error) {
        res.json({ message: error.message });
    }
}
 
export const createEvent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = "/uploads/events/" + req.file.filename;
        }
        await Event.create(data);
        res.json({
            "message": "Event Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }
}
 
export const updateEvent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = "/uploads/events/" + req.file.filename;
        }
        await Event.update(data, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Event Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const unspotEvent = async (req, res) => {
    try {
        await Event.update(req.body, {
            where: {
                spotlight: req.params.value
            }
        });
        res.json({
            "message": "Event Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteEvent = async (req, res) => {
    try {
        await Event.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Event Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}