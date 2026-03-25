import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DB_NAME;
const port = Number(process.env.DB_PORT || 3306);

const poolConfig: mysql.PoolOptions = {
  host,
  user,
  password,
  database,
  port,
  waitForConnections: true,
};

if (process.env.DB_SSL === 'true') poolConfig.ssl = { rejectUnauthorized: false };

const connection = mysql.createPool(poolConfig);

export default connection;
