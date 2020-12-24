const Pool = require('pg').Pool;

require('dotenv').config();

const databaseConfig = { connectionString: process.env.DATABASE_URL };

/*
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
*/
const pool = new Pool(databaseConfig);
module.exports = {pool};