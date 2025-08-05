const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetAdmin() {
  try {
    const pool = mysql.createPool({
      host: 'mysql.eryang.top',
      user: 'xiaohuang',
      password: '192837465@Hy',
      database: 'sunnav',
      port: 3307,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 先删除已存在的管理员用户
    await pool.execute('DELETE FROM users WHERE username = ?', ['admin']);
    
    // 创建新的管理员用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@example.com', hashedPassword, 'admin', 1]
    );

    console.log('✅ 管理员用户重置成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('用户ID:', result.insertId);

    // 验证用户创建成功
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_active FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      console.log('✅ 验证成功:', users[0]);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ 重置失败:', error);
  }
}

resetAdmin();