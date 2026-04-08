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
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    favoriteGame: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    freezeTableName: true,
    indexes: [
        { fields: ['userId'] }
    ]
});
 
export default Profile;