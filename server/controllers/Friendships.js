import Friendship from "../models/friendshipModel.js";
 
export const getAllFriendships = async (req, res) => {
    try {
        const friendships = await Friendship.findAll();
        res.json(friendships);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getFriendshipById = async (req, res) => {
    try {
        const friendship = await Friendship.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(friendship[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createFriendship = async (req, res) => {
    try {
        await Friendship.create(req.body);
        res.json({
            "message": "Friendship Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateFriendship = async (req, res) => {
    try {
        await Friendship.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Friendship Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteFriendship = async (req, res) => {
    try {
        await Friendship.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Friendship Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}