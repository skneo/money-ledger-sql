// sql model
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db')
class Customer extends Model { }

Customer.init({
    userId: {
        type: DataTypes.NUMBER,
        required: true
    },
    name: {
        type: DataTypes.STRING,
        required: true,
    },
    balance: {
        type: DataTypes.NUMBER,
        required: true
    },
    softDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Customer'
});
module.exports = Customer;