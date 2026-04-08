import EventAttendee from "../models/eventAttendeeModel.js";
 
export const getAllEventAttendees = async (req, res) => {
    try {
        const eventAttendees = await EventAttendee.findAll();
        res.json(eventAttendees);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getEventAttendeeById = async (req, res) => {
    try {
        const eventAttendee = await EventAttendee.findByPk(req.params.id);
        if (!eventAttendee) return res.status(404).json({ message: "Not found" });
        res.json(eventAttendee);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getEventAttendeesByEventId = async (req, res) => {
    try {
        const eventAttendees = await EventAttendee.findAll({
            where: {
                eventId: req.params.eventid
            }
        });
        res.json(eventAttendees);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getEventAttendeeByEventNUser = async (req, res) => {
    try {
        const eventAttendee = await EventAttendee.findAll({
            where: {
                eventId: req.params.eventid,
                userId: req.params.userid
            }
        });
        res.json(eventAttendee[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createEventAttendee = async (req, res) => {
    try {
        await EventAttendee.create(req.body);
        res.json({
            "message": "EventAttendee Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateEventAttendee = async (req, res) => {
    try {
        await EventAttendee.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "EventAttendee Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteEventAttendee = async (req, res) => {
    try {
        await EventAttendee.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "EventAttendee Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const deleteEventAttendeeByEventNUser = async (req, res) => {
    try {
        await EventAttendee.destroy({
            where: {
                eventId: req.params.eventid,
                userId: req.params.userid
            }
        });
        res.json({
            "message": "EventAttendee Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}