import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'rbb';

  console.log(`Menghubungkan ke database MySQL [${user}@${host}:${port}/${database}]...`);

  try {
    const db = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 1,
      connectTimeout: 5000,
    });

    const [tables] = await db.query('SHOW TABLES');
    console.log('✅ Koneksi MySQL BERHASIL!');
    console.log(`Jumlah tabel ditemukan: ${tables.length}`);
    await db.end();
    process.exit(0);
  } catch (e) {
    console.error('❌ Gagal terhubung ke MySQL:', e.message);
    process.exit(1);
  }
}

testConnection();
