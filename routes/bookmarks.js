const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cheerio = require('cheerio');
const { pool } = require('../config/database');
const { getBookmarkIcon } = require('../utils/iconHelper');

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

// 获取所有书签
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search, tag, favorite } = req.query;
    let query = `
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
             GROUP_CONCAT(t.name) as tags
      FROM bookmarks b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      WHERE b.user_id = ?
    `;
    
    const params = [req.user.userId];

    if (category && category !== 'all') {
      query += ' AND b.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (b.title LIKE ? OR b.description LIKE ? OR b.url LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (tag) {
      query += ' AND t.name = ?';
      params.push(tag);
    }

    if (favorite === 'true') {
      query += ' AND b.is_favorite = 1';
    }

    query += ' GROUP BY b.id ORDER BY b.created_at DESC';

    const [bookmarks] = await pool.execute(query, params);

    // 处理标签字符串为数组
    const processedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.tags ? bookmark.tags.split(',') : []
    }));

    res.json(processedBookmarks);
  } catch (error) {
    console.error('获取书签错误:', error);
    res.status(500).json({ error: '获取书签失败' });
  }
});

// 获取网页元数据
router.post('/fetch-metadata', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL不能为空' });
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL格式无效' });
    }

    // 设置请求头，模拟浏览器访问
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 提取标题
    let title = $('title').text().trim();
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || 
              $('meta[name="twitter:title"]').attr('content') || 
              '';
    }

    // 提取描述
    let description = $('meta[name="description"]').attr('content') || 
                     $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="twitter:description"]').attr('content') || 
                     '';

    // 如果描述为空，尝试从页面内容中提取
    if (!description) {
      const firstParagraph = $('p').first().text().trim();
      if (firstParagraph) {
        description = firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '');
      }
    }

    // 获取图标
    let icon_url = '';
    try {
      const iconResult = await getBookmarkIcon(url, title);
      icon_url = iconResult.icon_url;
    } catch (error) {
      console.error('获取图标失败:', error.message);
    }

    res.json({
      title: title || '',
      description: description || '',
      icon_url
    });

  } catch (error) {
    console.error('获取网页元数据错误:', error.message);
    
    // 根据错误类型返回不同的错误信息
    if (error.code === 'ENOTFOUND') {
      res.status(400).json({ error: '无法访问该网址' });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({ error: '请求超时，请检查网址是否可访问' });
    } else if (error.response?.status === 404) {
      res.status(404).json({ error: '网页不存在' });
    } else {
      res.status(500).json({ error: '获取网页信息失败，请手动填写' });
    }
  }
});

// 获取单个书签
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [bookmarks] = await pool.execute(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM bookmarks b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.userId]
    );

    if (bookmarks.length === 0) {
      return res.status(404).json({ error: '书签不存在' });
    }

    // 获取标签
    const [tags] = await pool.execute(
      'SELECT t.id, t.name, t.color FROM tags t ' +
      'JOIN bookmark_tags bt ON t.id = bt.tag_id ' +
      'WHERE bt.bookmark_id = ?',
      [req.params.id]
    );

    const bookmark = {
      ...bookmarks[0],
      tags: tags
    };

    res.json(bookmark);
  } catch (error) {
    console.error('获取书签详情错误:', error);
    res.status(500).json({ error: '获取书签详情失败' });
  }
});

// 创建书签
router.post('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { title, url, description, category_id, tags = [], icon_url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: '标题和URL为必填项' });
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL格式无效' });
    }

    // 完全移除自动获取图标功能，只使用用户提供的图标URL
    let finalIconUrl = icon_url || null;

    // 插入书签
    const [result] = await connection.execute(
      'INSERT INTO bookmarks (title, url, description, category_id, icon_url, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, url, description || null, category_id || null, finalIconUrl, req.user.userId]
    );

    const bookmarkId = result.insertId;

    // 处理标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 查找或创建标签
        let [tagRows] = await connection.execute(
          'SELECT id FROM tags WHERE name = ? AND user_id = ?',
          [tagName, req.user.userId]
        );

        let tagId;
        if (tagRows.length === 0) {
          const [tagResult] = await connection.execute(
            'INSERT INTO tags (name, user_id) VALUES (?, ?)',
            [tagName, req.user.userId]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }

        // 关联标签和书签
        await connection.execute(
          'INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
          [bookmarkId, tagId]
        );
      }
    }

    await connection.commit();

    // 获取新创建的书签
    const [newBookmark] = await connection.execute(
      'SELECT * FROM bookmarks WHERE id = ?',
      [bookmarkId]
    );

    res.status(201).json(newBookmark[0]);
  } catch (error) {
    await connection.rollback();
    console.error('创建书签错误:', error);
    res.status(500).json({ error: '创建书签失败' });
  } finally {
    connection.release();
  }
});

// 更新书签
router.put('/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { title, url, description, category_id, tags = [], icon_url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: '标题和URL为必填项' });
    }

    // 验证书签是否存在且属于用户
    const [existing] = await connection.execute(
      'SELECT id FROM bookmarks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: '书签不存在' });
    }

    // 使用用户提供的图标URL，如果没有提供则保持原图标不变
    let finalIconUrl = icon_url;
    if (finalIconUrl === undefined) {
      // 查询数据库获取当前图标
      const [currentBookmark] = await connection.execute(
        'SELECT icon_url FROM bookmarks WHERE id = ?',
        [req.params.id]
      );
      finalIconUrl = currentBookmark[0]?.icon_url || null;
    }
    
    // 限制图标URL长度，避免超出数据库字段限制
    if (finalIconUrl && finalIconUrl.length > 500) {
      finalIconUrl = finalIconUrl.substring(0, 500);
    }

    // 更新书签
    await connection.execute(
      'UPDATE bookmarks SET title = ?, url = ?, description = ?, category_id = ?, icon_url = ? WHERE id = ?',
      [title, url, description || null, category_id || null, finalIconUrl, req.params.id]
    );

    // 删除现有标签关联
    await connection.execute(
      'DELETE FROM bookmark_tags WHERE bookmark_id = ?',
      [req.params.id]
    );

    // 重新添加标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let [tagRows] = await connection.execute(
          'SELECT id FROM tags WHERE name = ? AND user_id = ?',
          [tagName, req.user.userId]
        );

        let tagId;
        if (tagRows.length === 0) {
          const [tagResult] = await connection.execute(
            'INSERT INTO tags (name, user_id) VALUES (?, ?)',
            [tagName, req.user.userId]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }

        await connection.execute(
          'INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
          [req.params.id, tagId]
        );
      }
    }

    await connection.commit();

    res.json({ message: '书签更新成功' });
  } catch (error) {
    await connection.rollback();
    console.error('更新书签错误:', error);
    res.status(500).json({ error: '更新书签失败' });
  } finally {
    connection.release();
  }
});

// 删除书签
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '书签不存在' });
    }

    res.json({ message: '书签删除成功' });
  } catch (error) {
    console.error('删除书签错误:', error);
    res.status(500).json({ error: '删除书签失败' });
  }
});

// 切换收藏状态
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE bookmarks SET is_favorite = NOT is_favorite WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '书签不存在' });
    }

    res.json({ message: '收藏状态更新成功' });
  } catch (error) {
    console.error('更新收藏状态错误:', error);
    res.status(500).json({ error: '更新收藏状态失败' });
  }
});

// 增加点击次数
router.patch('/:id/click', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE bookmarks SET click_count = click_count + 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    res.json({ message: '点击次数更新成功' });
  } catch (error) {
    console.error('更新点击次数错误:', error);
    res.status(500).json({ error: '更新点击次数失败' });
  }
});

module.exports = router;