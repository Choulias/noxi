import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const PlayerScore = db.define('ncs_playerscores',{
    gameSlug:{
        type: DataTypes.STRING
    },
    playerId:{
        type: DataTypes.INTEGER
    },
    clientName:{
        type: DataTypes.STRING
    },
    bestScore:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default PlayerScore;