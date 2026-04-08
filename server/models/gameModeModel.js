import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const GameMode = db.define('ncs_gamemodes', {
    gameSlug: {
        type: DataTypes.STRING
    },
    value: {
        type: DataTypes.STRING
    },
    label: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true
});

export default GameMode;
