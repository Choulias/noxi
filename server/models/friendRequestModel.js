import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const FriendRequest = db.define('ncs_friendrequests',{
    inviterId:{
        type: DataTypes.INTEGER
    },
    invitedId:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default FriendRequest;