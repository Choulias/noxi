import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Badge = db.define('ncs_badges', {
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    icon: {
        type: DataTypes.STRING
    },
    condition_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    condition_value: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    condition_game: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true
});

export default Badge;
