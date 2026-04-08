import EventLiker from "../models/eventLikerModel.js";
 
export const getAllEventLikers = async (req, res) => {
    try {
        const eventLikers = await EventLiker.findAll();
        res.json(eventLikers);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getEventLikerById = async (req, res) => {
    try {
        const eventLiker = await EventLiker.findByPk(req.params.id);
        if (!eventLiker) return res.status(404).json({ message: "Not found" });
        res.json(eventLiker);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getEventLikersByEventId = async (req, res) => {
    try {
        const eventLikers = await EventLiker.findAll({
            where: {
                eventId: req.params.eventid
            }
        });
        res.json(eventLikers);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createEventLiker = async (req, res) => {
    try {
        await EventLiker.create(req.body);
        res.json({
            "message": "EventLiker Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateEventLiker = async (req, res) => {
    try {
        await EventLiker.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "EventLiker Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteEventLiker = async (req, res) => {
    try {
        await EventLiker.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "EventLiker Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const deleteEventLikerByEventNUser = async (req, res) => {
    try {
        await EventLiker.destroy({
            where: {
                eventId: req.params.eventid,
                userId: req.params.userid
            }
        });
        res.json({
            "message": "EventLiker Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}