const {DataTypes} = require("sequelize");
const sequelize = require("../database");

const Transaction = sequelize.define("Transaction", {
    transactionId: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userWalletAddr: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    ccy: {
        type: DataTypes.STRING(3)
    },
    timeStamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    transactionStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "inProcess"
    }

});

module.exports = {
    Transaction
};