const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function testAdminLogin() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sun_nav',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 检查管理员用户
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('❌ 管理员用户不存在');
      return;
    }

    const admin = users[0];
    console.log('✅ 找到管理员用户:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active
    });

    // 验证密码
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password_hash);
    
    if (isValid) {
      console.log('✅ 密码验证成功');
    } else {
      console.log('❌ 密码验证失败');
      // 显示密码哈希以供调试
      console.log('密码哈希:', admin.password_hash);
      
      // 生成新的正确哈希
      const newHash = await bcrypt.hash('admin123', 10);
      console.log('正确哈希应该是:', newHash);
    }

    await pool.end();
  } catch (error) {
    console.error('错误:', error);
  }
}

testAdminLogin();