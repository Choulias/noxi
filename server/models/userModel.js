import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
const { DataTypes } = Sequelize;
 
const User = db.define('ncs_users',{
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    mail:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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