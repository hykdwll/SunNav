const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sunnav',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

// 初始化数据库表
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // 创建表（如果不存在）
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(7) DEFAULT '#3B82F6',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createBookmarksTable = `
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        category_id INT,
        user_id INT,
        is_favorite BOOLEAN DEFAULT FALSE,
        click_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createTagsTable = `
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        color VARCHAR(7) DEFAULT '#6B7280',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_tag (name, user_id)
      )
    `;

    const createBookmarkTagsTable = `
      CREATE TABLE IF NOT EXISTS bookmark_tags (
        bookmark_id INT,
        tag_id INT,
        PRIMARY KEY (bookmark_id, tag_id),
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await connection.query(createUsersTable);
    await connection.query(createCategoriesTable);
    await connection.query(createBookmarksTable);
    await connection.query(createTagsTable);
    await connection.query(createBookmarkTagsTable);
    
    // 插入默认分类
    const insertDefaultsSQL = `
      INSERT IGNORE INTO categories (name, icon, color, sort_order) VALUES 
      ('常用网站', 'star', '#F59E0B', 1),
      ('开发工具', 'code', '#10B981', 2),
      ('学习资源', 'book', '#8B5CF6', 3),
      ('娱乐', 'gamepad', '#EF4444', 4),
      ('社交媒体', 'users', '#3B82F6', 5);
    `;
    
    await connection.query(insertDefaultsSQL);
    
    console.log('✅ 数据库表初始化完成');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};