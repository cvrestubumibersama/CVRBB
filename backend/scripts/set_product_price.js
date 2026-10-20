import db from '../src/db.js';

async function run() {
  const id = process.argv[2] || '1';
  const price = process.argv[3] ?? 'Rp 100.000';
  try {
    const [res] = await db.query('UPDATE products SET price = ? WHERE id = ?', [price, id]);
    console.log('Updated rows:', res.affectedRows);
    process.exit(0);
  } catch (err) {
    console.error('Error updating price:', err);
    process.exit(1);
  }
}

run();
