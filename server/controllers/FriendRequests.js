import FriendRequest from "../models/friendRequestModel.js";
 
export const getAllFriendRequests = async (req, res) => {
    try {
        const friendRequests = await FriendRequest.findAll();
        res.json(friendRequests);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getFriendRequestById = async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(friendRequest[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createFriendRequest = async (req, res) => {
    try {
        await FriendRequest.create(req.body);
        res.json({
            "message": "FriendRequest Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateFriendRequest = async (req, res) => {
    try {
        await FriendRequest.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "FriendRequest Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteFriendRequest = async (req, res) => {
    try {
        await FriendRequest.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "FriendRequest Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}