require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    console.log('Connected to database');

    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('first_name', 'last_name')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    if (!existingColumns.includes('first_name')) {
      console.log('Adding first_name column...');
      await connection.query(`ALTER TABLE users ADD COLUMN first_name VARCHAR(255)`);
      console.log('✓ Added first_name column');
    } else {
      console.log('✓ first_name column already exists');
    }

    if (!existingColumns.includes('last_name')) {
      console.log('Adding last_name column...');
      await connection.query(`ALTER TABLE users ADD COLUMN last_name VARCHAR(255)`);
      console.log('✓ Added last_name column');
    } else {
      console.log('✓ last_name column already exists');
    }

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

migrate();
