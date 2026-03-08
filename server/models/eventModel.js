import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const Event = db.define('ncs_events',{
    title:{
        type: DataTypes.STRING
    },
    theme:{
        type: DataTypes.STRING
    },
    description:{
        type: DataTypes.STRING
    },
    spotlight:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default Event;