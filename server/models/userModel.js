import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const User = db.define('ncs_users',{
    username:{
        type: DataTypes.STRING
    },
    password:{
        type: DataTypes.STRING
    },
    mail:{
        type: DataTypes.STRING
    },
    role:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.STRING
    },
    verificationString:{
        type: DataTypes.STRING
    }
},{
    freezeTableName: true
});
 
export default User;