import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const Profile = db.define('ncs_profiles',{
    userId:{
        type: DataTypes.INTEGER
    },
    nickname:{
        type: DataTypes.STRING
    },
    age:{
        type: DataTypes.INTEGER
    },
    bio:{
        type: DataTypes.STRING
    },
    picture:{
        type: DataTypes.STRING
    }
},{
    freezeTableName: true
});
 
export default Profile;