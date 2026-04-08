import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const Game = db.define('ncs_games',{
    gameId:{
        type: DataTypes.STRING
    },
    ownerId:{
        type: DataTypes.INTEGER
    },
    numberPlayers:{
        type: DataTypes.INTEGER
    },
    maxPlayers:{
        type: DataTypes.INTEGER
    },
    status:{
        type: DataTypes.STRING
    },
    gameModel:{
        type: DataTypes.STRING
    },
    reach:{
        type: DataTypes.STRING
    },
    gameMode:{
        type: DataTypes.STRING,
        defaultValue: 'classique'
    }
},{
    freezeTableName: true
});
 
export default Game;