// sql model
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db')
class Transaction extends Model { }

Transaction.init({
    userId: {
        type: DataTypes.NUMBER,
        required: true
    },
    customerId: {
        type: DataTypes.NUMBER,
        required: true
    },
    amount: {
        type: DataTypes.NUMBER,
        required: true
    },
    balance: {
        type: DataTypes.NUMBER,
        required: true
    },
    remark: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.STRING,
        required: true
    }
}, {
    sequelize,
    modelName: 'Transaction'
});
module.exports = Transaction;