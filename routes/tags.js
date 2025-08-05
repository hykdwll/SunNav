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

// 获取所有标签
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [tags] = await pool.execute(
      `SELECT t.id, t.name, t.color, COUNT(bt.bookmark_id) as bookmark_count
       FROM tags t
       LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
       WHERE t.user_id = ?
       GROUP BY t.id, t.name, t.color
       ORDER BY bookmark_count DESC, t.name ASC`,
      [req.user.userId]
    );

    res.json(tags);
  } catch (error) {
    console.error('获取标签错误:', error);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 创建标签
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: '标签名称为必填项' });
    }

    // 检查标签是否已存在
    const [existing] = await pool.execute(
      'SELECT id FROM tags WHERE name = ? AND user_id = ?',
      [name, req.user.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: '标签已存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)',
      [name, color || '#6B7280', req.user.userId]
    );

    const [newTag] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newTag[0]);
  } catch (error) {
    console.error('创建标签错误:', error);
    res.status(500).json({ error: '创建标签失败' });
  }
});

// 更新标签
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: '标签名称为必填项' });
    }

    // 检查名称是否已存在（排除当前标签）
    const [existing] = await pool.execute(
      'SELECT id FROM tags WHERE name = ? AND user_id = ? AND id != ?',
      [name, req.user.userId, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: '标签名称已存在' });
    }

    const [result] = await pool.execute(
      'UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, color, req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '标签不存在' });
    }

    res.json({ message: '标签更新成功' });
  } catch (error) {
    console.error('更新标签错误:', error);
    res.status(500).json({ error: '更新标签失败' });
  }
});

// 删除标签
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM tags WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '标签不存在' });
    }

    res.json({ message: '标签删除成功' });
  } catch (error) {
    console.error('删除标签错误:', error);
    res.status(500).json({ error: '删除标签失败' });
  }
});

// 获取标签下的书签
router.get('/:id/bookmarks', authenticateToken, async (req, res) => {
  try {
    const [bookmarks] = await pool.execute(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM bookmarks b
       LEFT JOIN categories c ON b.category_id = c.id
       JOIN bookmark_tags bt ON b.id = bt.bookmark_id
       WHERE bt.tag_id = ? AND b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.id, req.user.userId]
    );

    res.json(bookmarks);
  } catch (error) {
    console.error('获取标签书签错误:', error);
    res.status(500).json({ error: '获取标签书签失败' });
  }
});

// 搜索标签
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const [tags] = await pool.execute(
      `SELECT t.id, t.name, t.color, COUNT(bt.bookmark_id) as bookmark_count
       FROM tags t
       LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
       WHERE t.user_id = ? AND t.name LIKE ?
       GROUP BY t.id, t.name, t.color
       ORDER BY bookmark_count DESC, t.name ASC`,
      [req.user.userId, query]
    );

    res.json(tags);
  } catch (error) {
    console.error('搜索标签错误:', error);
    res.status(500).json({ error: '搜索标签失败' });
  }
});

module.exports = router;