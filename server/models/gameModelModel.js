import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const GameModel = db.define('ncs_gamemodels',{
    name:{
        type: DataTypes.STRING
    },
    slug:{
        type: DataTypes.STRING
    },
    description:{
        type: DataTypes.STRING
    },
    image:{
        type: DataTypes.STRING
    },
    playersMin:{
        type: DataTypes.INTEGER
    },
    playersLimit:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default GameModel;