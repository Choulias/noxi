import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const EventAttendee = db.define('ncs_eventattendees',{
    eventId:{
        type: DataTypes.INTEGER
    },
    userId:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default EventAttendee ;