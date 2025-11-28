const mysql = require('mysql2/promise');

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection and initialize database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Users table ready');

    // Add first_name and last_name columns if they don't exist (for existing databases)
    try {
      // Check if columns exist first
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('first_name', 'last_name')
      `);

      const existingColumns = columns.map(col => col.COLUMN_NAME);

      if (!existingColumns.includes('first_name')) {
        await connection.query(`ALTER TABLE users ADD COLUMN first_name VARCHAR(255)`);
        console.log('Added first_name column to users table');
      }

      if (!existingColumns.includes('last_name')) {
        await connection.query(`ALTER TABLE users ADD COLUMN last_name VARCHAR(255)`);
        console.log('Added last_name column to users table');
      }
    } catch (err) {
      console.log('Error adding name columns:', err.message);
    }

    // Create qr_codes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,

        color_dark VARCHAR(7) DEFAULT '#000000',
        color_light VARCHAR(7) DEFAULT '#ffffff',
        size INT DEFAULT 300,
        error_correction VARCHAR(1) DEFAULT 'M',

        tags JSON,
        folder VARCHAR(255),
        notes TEXT,
        is_favorite TINYINT(1) DEFAULT 0,

        is_dynamic TINYINT(1) DEFAULT 0,
        redirect_url TEXT,
        short_code VARCHAR(255) UNIQUE,

        scan_count INT DEFAULT 0,
        last_scanned_at TIMESTAMP NULL,

        file_path VARCHAR(500),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_short_code (short_code),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('QR codes table ready');

    // Create tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) DEFAULT '#3b82f6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_tag (user_id, name),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Tags table ready');

    // Create scans table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        qr_code_id INT NOT NULL,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        device_type VARCHAR(20),
        browser VARCHAR(50),
        os VARCHAR(50),
        country_code VARCHAR(2),
        country_name VARCHAR(100),
        city VARCHAR(100),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE,
        INDEX idx_qr_code_id (qr_code_id),
        INDEX idx_scanned_at (scanned_at),
        INDEX idx_country_code (country_code),
        INDEX idx_device_type (device_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Scans table ready');

    // Add analytics columns to scans table if they don't exist (for existing databases)
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'scans'
        AND COLUMN_NAME IN ('device_type', 'browser', 'os', 'country_code', 'country_name', 'city', 'latitude', 'longitude')
      `);

      const existingColumns = columns.map(col => col.COLUMN_NAME);

      if (!existingColumns.includes('device_type')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN device_type VARCHAR(20)`);
        console.log('Added device_type column to scans table');
      }

      if (!existingColumns.includes('browser')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN browser VARCHAR(50)`);
        console.log('Added browser column to scans table');
      }

      if (!existingColumns.includes('os')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN os VARCHAR(50)`);
        console.log('Added os column to scans table');
      }

      if (!existingColumns.includes('country_code')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN country_code VARCHAR(2)`);
        await connection.query(`CREATE INDEX idx_country_code ON scans(country_code)`);
        console.log('Added country_code column to scans table');
      }

      if (!existingColumns.includes('country_name')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN country_name VARCHAR(100)`);
        console.log('Added country_name column to scans table');
      }

      if (!existingColumns.includes('city')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN city VARCHAR(100)`);
        console.log('Added city column to scans table');
      }

      if (!existingColumns.includes('latitude')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN latitude DECIMAL(10,8)`);
        console.log('Added latitude column to scans table');
      }

      if (!existingColumns.includes('longitude')) {
        await connection.query(`ALTER TABLE scans ADD COLUMN longitude DECIMAL(11,8)`);
        console.log('Added longitude column to scans table');
      }

      if (!existingColumns.includes('device_type')) {
        await connection.query(`CREATE INDEX idx_device_type ON scans(device_type)`);
      }
    } catch (err) {
      console.log('Analytics columns migration:', err.message);
    }

    connection.release();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Helper function to execute queries
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper function to get a single row
async function getAsync(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('Get query error:', error);
    throw error;
  }
}

// Helper function to get all rows
async function allAsync(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('All query error:', error);
    throw error;
  }
}

// Helper function to run insert/update/delete queries
async function runAsync(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    return {
      id: result.insertId,
      affectedRows: result.affectedRows,
      changes: result.affectedRows
    };
  } catch (error) {
    console.error('Run query error:', error);
    throw error;
  }
}

// Initialize database on module load
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = {
  pool,
  query,
  runAsync,
  getAsync,
  allAsync,
  initializeDatabase
};