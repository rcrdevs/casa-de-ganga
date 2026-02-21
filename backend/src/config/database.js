// backend/src/config/database.js
import mysql from 'mysql2/promise';
import { config } from './index.js';

export const db = await mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});