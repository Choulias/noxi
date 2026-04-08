import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Message = db.define('ncs_messages', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true // null = game chat message (not private)
    },
    senderName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    freezeTableName: true,
    indexes: [
        { fields: ['senderId'] },
        { fields: ['receiverId'] },
        { fields: ['senderId', 'receiverId'] }
    ]
});

export default Message;
