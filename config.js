const dotenv = require('dotenv').config();

const DB_PASSWORD = process.env.DB_PASSWORD;
const DATASOURCE = process.env.DATASOURCE;
const SESSION_SECRET = process.env.SESSION_SECRET;
console.log({ DATASOURCE });

const mongodb = {
  uri: `mongodb+srv://maurocig:${DB_PASSWORD}@coderxx.fm0gxl1.mongodb.net/?retryWrites=true&w=majority`,
};

module.exports = {
  DB_PASSWORD,
  DATASOURCE,
  SESSION_SECRET,
  mongodb,
};
