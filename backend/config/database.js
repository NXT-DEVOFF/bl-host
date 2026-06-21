const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const config = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    ...config,
    storage: process.env.DB_STORAGE || './database.sqlite',
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      ...config,
      host: process.env.DB_HOST,
    }
  );
}

module.exports = sequelize;
