import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const UserBadge = db.define('ncs_user_badges', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['userId', 'badgeId'], unique: true }
    ]
});

export default UserBadge;
