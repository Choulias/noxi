import { Sequelize } from "sequelize";
import FriendRequest from "../models/friendRequestModel.js";
import Friendship from "../models/friendshipModel.js";

const { Op } = Sequelize;

export const getMyFriendRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.findAll({
            where: {
                [Op.or]: [
                    { inviterId: req.user.id },
                    { invitedId: req.user.id }
                ]
            }
        });
        res.json(requests);
    } catch (error) {
        res.json({ message: error.message });
    }
};

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
        const friendRequest = await FriendRequest.findByPk(req.params.id);
        if (!friendRequest) return res.status(404).json({ message: "Not found" });
        res.json(friendRequest);
    } catch (error) {
        res.json({ message: error.message });
    }
}
 
export const createFriendRequest = async (req, res) => {
    try {
        const { inviterId, invitedId } = req.body;

        // Prevent self-requests
        if (inviterId === invitedId) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous ajouter vous-meme." });
        }

        // Check for existing request between the two users
        const existingRequest = await FriendRequest.findOne({
            where: {
                [Op.or]: [
                    { inviterId, invitedId },
                    { inviterId: invitedId, invitedId: inviterId }
                ]
            }
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Une demande d'ami existe deja entre ces deux utilisateurs." });
        }

        // Check for existing friendship
        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { uid_1: inviterId, uid_2: invitedId },
                    { uid_1: invitedId, uid_2: inviterId }
                ]
            }
        });
        if (existingFriendship) {
            return res.status(400).json({ message: "Vous etes deja amis." });
        }

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
        const friendRequest = await FriendRequest.findByPk(req.params.id);
        if (!friendRequest) return res.status(404).json({ message: "Not found" });
        if (friendRequest.inviterId !== req.user.id && friendRequest.invitedId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }
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