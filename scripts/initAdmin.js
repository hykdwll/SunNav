const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initAdmin() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SunNav',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 检查管理员是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (existingUsers.length > 0) {
      console.log('管理员用户已存在');
      return;
    }

    // 创建管理员用户
    const passwordHash = await bcrypt.hash('admin123', 10);
    await pool.execute(
      'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@example.com', passwordHash, 'admin', 1]
    );

    console.log('管理员用户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');

    await pool.end();
  } catch (error) {
    console.error('初始化管理员用户失败:', error);
  }
}

initAdmin();