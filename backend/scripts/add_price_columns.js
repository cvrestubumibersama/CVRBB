import db from '../src/db.js';

async function run() {
  try {
    console.log('Adding price column to product_categories...');
    await db.query("ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS price varchar(255) NULL");
    console.log('Adding price column to products...');
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS price varchar(255) NULL");
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
