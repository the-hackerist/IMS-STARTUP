import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let connection: mysql.Pool;

try {
  connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
} catch (error) {
  throw Error;
}

export default connection;
