const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

/**
 * 自动获取网站的favicon图标
 * @param {string} websiteUrl - 网站URL
 * @returns {Promise<string|null>} - 图标URL或null
 */
async function getWebsiteIcon(websiteUrl) {
  try {
    // 首先尝试获取网站的favicon.ico
    const urlObj = new URL(websiteUrl);
    const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    
    try {
      const response = await axios.head(faviconUrl, { timeout: 5000 });
      if (response.status === 200) {
        return faviconUrl;
      }
    } catch (error) {
      // favicon.ico不存在，继续查找
    }

    // 从HTML页面中查找图标
    const response = await axios.get(websiteUrl, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    // 查找各种可能的图标链接
    const iconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]'
    ];

    for (const selector of iconSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        let iconUrl = element.attr('href') || element.attr('content');
        if (iconUrl) {
          // 处理相对路径
          if (!iconUrl.startsWith('http')) {
            iconUrl = new URL(iconUrl, websiteUrl).href;
          }
          return iconUrl;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('获取网站图标失败:', error.message);
    return null;
  }
}

/**
 * 从标题中提取首字母或首汉字
 * @param {string} title - 网站标题
 * @returns {string} - 首字母或汉字
 */
function getFirstChar(title) {
  if (!title || typeof title !== 'string') return '🔗';
  
  // 去除空格
  title = title.trim();
  if (!title) return '🔗';

  const firstChar = title[0];
  
  // 如果是英文字母，返回大写
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }
  
  // 如果是汉字，返回汉字
  if (/[\u4e00-\u9fa5]/.test(firstChar)) {
    return firstChar;
  }
  
  // 如果是数字或其他字符，返回对应字符
  return firstChar;
}

/**
 * 生成简单的SVG图标作为备选
 * @param {string} text - 要显示的文本
 * @param {string} bgColor - 背景颜色
 * @returns {string} - SVG数据URL
 */
function generateLetterIcon(text, bgColor = '#3B82F6') {
  const safeText = text.length > 1 ? text[0].toUpperCase() : text.toUpperCase();
  
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="${bgColor}" rx="6"/>
      <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
            text-anchor="middle" fill="white">${safeText}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * 获取图标的主要功能
 * @param {string} websiteUrl - 网站URL
 * @param {string} title - 网站标题
 * @returns {Promise<Object>} - 包含图标URL和类型
 */
async function getBookmarkIcon(websiteUrl, title) {
  let iconUrl = null;
  let iconType = 'auto';

  // 尝试自动获取网站图标
  if (websiteUrl) {
    iconUrl = await getWebsiteIcon(websiteUrl);
    if (iconUrl) {
      iconType = 'favicon';
    }
  }

  // 如果无法获取图标，使用首字母图标
  if (!iconUrl) {
    const firstChar = getFirstChar(title);
    iconUrl = generateLetterIcon(firstChar);
    iconType = 'letter';
  }

  return {
    icon_url: iconUrl,
    icon_type: iconType
  };
}

module.exports = {
  getWebsiteIcon,
  getFirstChar,
  generateLetterIcon,
  getBookmarkIcon
};