import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const EventLiker = db.define('ncs_eventlikers',{
    eventId:{
        type: DataTypes.INTEGER
    },
    userId:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default EventLiker ;