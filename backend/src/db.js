import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'rbb',
  waitForConnections: true,
  // Dikurangi dari 10 → 3 untuk hemat RAM di shared hosting 1GB.
  // Cukup untuk traffic company profile kecil-menengah.
  connectionLimit: 3,
  queueLimit: 0,
  // Buang koneksi idle setelah 30 detik agar tidak makan RAM terus-menerus
  idleTimeout: 30000,
  // Jaga koneksi tetap hidup agar tidak perlu reconnect terus
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default pool;
