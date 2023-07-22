const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db')
class User extends Model { }

User.init({
    name: {
        type: DataTypes.STRING,
        required: true
    },
    email: {
        type: DataTypes.STRING,
        required: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        required: true
    },
    last_login: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    sequelize,
    modelName: 'User'
});
module.exports = User;