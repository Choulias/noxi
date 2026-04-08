import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const GamePlayer = db.define('ncs_gameplayers',{
    gameId:{
        type: DataTypes.STRING
    },
    playerId:{
        type: DataTypes.INTEGER
    },
    clientId:{
        type: DataTypes.STRING
    },
    clientName:{
        type: DataTypes.STRING
    },
    score:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true,
    indexes: [
        { fields: ['gameId'] }
    ]
});
 
export default GamePlayer;