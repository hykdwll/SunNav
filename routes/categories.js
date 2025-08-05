const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// 验证token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供token' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'token无效' });
    }
    req.user = user;
    next();
  });
};

// 获取所有分类
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT id, name, icon, color, sort_order FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY sort_order ASC, name ASC',
      [req.user.userId]
    );

    // 获取每个分类的书签数量
    const [counts] = await pool.execute(
      'SELECT category_id, COUNT(*) as count FROM bookmarks WHERE user_id = ? GROUP BY category_id',
      [req.user.userId]
    );

    const countsMap = {};
    counts.forEach(item => {
      countsMap[item.category_id] = item.count;
    });

    const categoriesWithCount = categories.map(category => ({
      ...category,
      bookmark_count: countsMap[category.id] || 0
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 创建分类
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, icon, color, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: '分类名称为必填项' });
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (name, icon, color, sort_order, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, icon || 'folder', color || '#3B82F6', sort_order || 0, req.user.userId]
    );

    const [newCategory] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({ error: '创建分类失败' });
  }
});

// 更新分类
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, icon, color, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: '分类名称为必填项' });
    }

    const [result] = await pool.execute(
      'UPDATE categories SET name = ?, icon = ?, color = ?, sort_order = ? WHERE id = ? AND user_id = ?',
      [name, icon, color, sort_order, req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '分类不存在' });
    }

    res.json({ message: '分类更新成功' });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({ error: '更新分类失败' });
  }
});

// 删除分类
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // 检查是否有书签使用该分类
    const [bookmarks] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookmarks WHERE category_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (bookmarks[0].count > 0) {
      return res.status(400).json({ 
        error: `该分类下有${bookmarks[0].count}个书签，请先移动或删除这些书签` 
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '分类不存在' });
    }

    res.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ error: '删除分类失败' });
  }
});

// 获取分类统计
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        COUNT(b.id) as bookmark_count,
        SUM(b.click_count) as total_clicks
      FROM categories c
      LEFT JOIN bookmarks b ON c.id = b.category_id AND b.user_id = ?
      WHERE c.user_id IS NULL OR c.user_id = ?
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY c.sort_order ASC, c.name ASC
    `, [req.user.userId, req.user.userId]);

    res.json(stats);
  } catch (error) {
    console.error('获取分类统计错误:', error);
    res.status(500).json({ error: '获取分类统计失败' });
  }
});

module.exports = router;