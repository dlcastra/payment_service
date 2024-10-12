const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '/var/lib/sqlite3/data/database.sqlite'
});

module.exports = sequelize;