const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const db = {};

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Server = require('./Server')(sequelize, DataTypes);

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;