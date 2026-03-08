import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const Friendship = db.define('ncs_friendships',{
    uid_1:{
        type: DataTypes.INTEGER
    },
    uid_2:{
        type: DataTypes.INTEGER
    }
},{
    freezeTableName: true
});
 
export default Friendship;