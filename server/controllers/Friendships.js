import { Sequelize } from "sequelize";
import Friendship from "../models/friendshipModel.js";

const { Op } = Sequelize;

export const getMyFriendships = async (req, res) => {
    try {
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { uid_1: req.user.id },
                    { uid_2: req.user.id }
                ]
            }
        });
        res.json(friendships);
    } catch (error) {
        res.json({ message: error.message });
    }
};

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
        const friendship = await Friendship.findByPk(req.params.id);
        if (!friendship) return res.status(404).json({ message: "Not found" });
        res.json(friendship);
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
        const friendship = await Friendship.findByPk(req.params.id);
        if (!friendship) return res.status(404).json({ message: "Not found" });
        if (friendship.uid_1 !== req.user.id && friendship.uid_2 !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }
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