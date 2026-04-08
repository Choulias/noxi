import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { Op } from "sequelize";
import db from "../config/database.js";

export const getConversation = async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = parseInt(req.params.userId);
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 50;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: myId, receiverId: otherId },
                    { senderId: otherId, receiverId: myId }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit,
            offset: page * limit
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConversationsList = async (req, res) => {
    try {
        const myId = req.user.id;

        // Find all distinct conversation partners
        const [results] = await db.query(`
            SELECT
                CASE
                    WHEN senderId = :myId THEN receiverId
                    ELSE senderId
                END AS partnerId,
                CASE
                    WHEN senderId = :myId THEN receiverId
                    ELSE senderId
                END AS partnerIdForGroup
            FROM ncs_messages
            WHERE senderId = :myId OR receiverId = :myId
            GROUP BY partnerIdForGroup
        `, { replacements: { myId } });

        const conversations = [];

        for (const row of results) {
            const partnerId = row.partnerId;

            // Get last message
            const lastMessage = await Message.findOne({
                where: {
                    [Op.or]: [
                        { senderId: myId, receiverId: partnerId },
                        { senderId: partnerId, receiverId: myId }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });

            // Get unread count from this partner
            const unreadCount = await Message.count({
                where: {
                    senderId: partnerId,
                    receiverId: myId,
                    read: false
                }
            });

            const partnerUser = await User.findByPk(partnerId, { attributes: ['id', 'username'] });
            conversations.push({
                userId: partnerId,
                username: partnerUser?.username || 'Utilisateur inconnu',
                lastMessage: lastMessage?.content || '',
                lastMessageAt: lastMessage?.createdAt || null,
                unreadCount
            });
        }

        // Sort by last message date descending
        conversations.sort((a, b) => {
            const dateA = new Date(a.lastMessageAt || 0).getTime();
            const dateB = new Date(b.lastMessageAt || 0).getTime();
            return dateB - dateA;
        });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const content = (req.body.content || "").trim();
        if (!content) {
            return res.status(400).json({ message: "Le message ne peut pas être vide" });
        }
        if (content.length > 500) {
            return res.status(400).json({ message: "Le message ne peut pas dépasser 500 caractères" });
        }

        const message = await Message.create({
            senderId: req.user.id,
            receiverId: req.body.receiverId,
            senderName: req.user.username,
            content
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const senderId = parseInt(req.params.senderId);
        const myId = req.user.id;

        await Message.update(
            { read: true },
            {
                where: {
                    senderId,
                    receiverId: myId,
                    read: false
                }
            }
        );

        res.json({ message: "Messages marqués comme lus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.count({
            where: {
                receiverId: req.user.id,
                read: false
            }
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
