const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

/**
 * 自动获取网站的favicon图标（支持高质量图标获取）
 * @param {string} websiteUrl - 网站URL
 * @returns {Promise<string|null>} - 图标URL或null
 */
async function getWebsiteIcon(websiteUrl) {
  console.log('尝试获取网站图标:', websiteUrl);
  try {
    const urlObj = new URL(websiteUrl);
    
    // 1. 首先尝试获取高质量图标（apple-touch-icon等）
    try {
      const response = await axios.get(websiteUrl, { timeout: 10000 });
      const $ = cheerio.load(response.data);

      // 优先查找高质量的图标
      const highQualityIconSelectors = [
        { selector: 'link[rel="apple-touch-icon"]', priority: 1 },
        { selector: 'link[rel="apple-touch-icon-precomposed"]', priority: 2 },
        { selector: 'link[rel="icon"][sizes*="192"]', priority: 3 },
        { selector: 'link[rel="icon"][sizes*="180"]', priority: 4 },
        { selector: 'link[rel="icon"][sizes*="128"]', priority: 5 },
        { selector: 'link[rel="icon"][sizes*="96"]', priority: 6 },
        { selector: 'link[rel="icon"]', priority: 7 },
        { selector: 'link[rel="shortcut icon"]', priority: 8 },
        { selector: 'meta[property="og:image"]', priority: 9 },
        { selector: 'meta[name="twitter:image"]', priority: 10 }
      ];

      let bestIcon = null;
      let bestPriority = 999;

      for (const { selector, priority } of highQualityIconSelectors) {
        const elements = $(selector);
        
        if (elements.length > 0) {
          elements.each((index, element) => {
            const $element = $(element);
            let iconUrl = $element.attr('href') || $element.attr('content');
            
            if (iconUrl) {
              // 处理相对路径
              if (!iconUrl.startsWith('http')) {
                iconUrl = new URL(iconUrl, websiteUrl).href;
              }
              
              // 检查图标格式，优先选择PNG等高质量格式
              const isHighQuality = iconUrl.match(/\.(png|jpg|jpeg|webp|svg)(\?.*)?$/i);
              const size = $element.attr('sizes') || '';
              
              if (isHighQuality || size.includes('192') || size.includes('180') || size.includes('128')) {
                if (priority < bestPriority) {
                  bestIcon = iconUrl;
                  bestPriority = priority;
                }
              }
            }
          });
        }
      }

      if (bestIcon) {
        console.log('找到高质量图标:', bestIcon);
        return bestIcon;
      }
    } catch (error) {
      console.error('从HTML获取图标失败:', error.message);
    }

    // 2. 尝试多种favicon路径
    const faviconPaths = [
      '/apple-touch-icon.png',
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/android-chrome-192x192.png',
      '/android-chrome-512x512.png',
      '/mstile-150x150.png',
      '/safari-pinned-tab.svg',
      '/favicon.ico'
    ];

    for (const path of faviconPaths) {
      try {
        const faviconUrl = `${urlObj.protocol}//${urlObj.host}${path}`;
        const response = await axios.head(faviconUrl, { timeout: 5000 });
        if (response.status === 200) {
          console.log(`成功获取${path}:`, faviconUrl);
          return faviconUrl;
        }
      } catch (error) {
        console.log(`${path}不存在，继续查找`);
      }
    }

    // 3. 尝试/favicon.ico作为最后手段
    try {
      const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
      const response = await axios.head(faviconUrl, { timeout: 5000 });
      if (response.status === 200) {
        console.log('成功获取favicon.ico:', faviconUrl);
        return faviconUrl;
      }
    } catch (error) {
      console.error('获取favicon.ico失败:', error.message);
    }

    // 4. 尝试中国用户可访问的备选图标源
    try {
      const altSources = [
        `${urlObj.protocol}//${urlObj.host}/apple-touch-icon.png`,
        `${urlObj.protocol}//${urlObj.host}/apple-touch-icon-precomposed.png`,
        `${urlObj.protocol}//${urlObj.host}/touch-icon-192x192.png`,
        `${urlObj.protocol}//${urlObj.host}/mstile-144x144.png`,
        `${urlObj.protocol}//${urlObj.host}/android-chrome-192x192.png`,
        `${urlObj.protocol}//${urlObj.host}/logo.png`,
        `${urlObj.protocol}//${urlObj.host}/icon.png`,
        `${urlObj.protocol}//${urlObj.host}/siteicon.png`,
        `${urlObj.protocol}//${urlObj.host}/assets/favicon.ico`,
        `${urlObj.protocol}//${urlObj.host}/static/favicon.ico`,
        `${urlObj.protocol}//${urlObj.host}/images/favicon.ico`,
        `${urlObj.protocol}//${urlObj.host}/img/favicon.ico`,
        `${urlObj.protocol}//${urlObj.host}/public/favicon.ico`
      ];

      for (const altUrl of altSources) {
        try {
          const response = await axios.head(altUrl, { timeout: 3000 });
          if (response.status === 200) {
            console.log('成功获取备选图标:', altUrl);
            return altUrl;
          }
        } catch (error) {
          // 继续尝试下一个备选源
        }
      }
    } catch (error) {
      console.error('获取备选图标失败:', error.message);
    }

    console.log('未找到任何图标');
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
 * 生成美观的SVG图标作为备选
 * @param {string} text - 要显示的文本
 * @param {string} bgColor - 背景颜色
 * @returns {string} - SVG数据URL
 */
function generateLetterIcon(text, bgColor = '#3B82F6') {
  const safeText = text.length > 1 ? text[0].toUpperCase() : text.toUpperCase();
  
  // 生成基于文本的渐变色
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
    '#10B981', '#06B6D4', '#6366F1', '#8B5CF6', '#EC4899'
  ];
  
  const colorIndex = safeText.charCodeAt(0) % colors.length;
  const selectedColor = colors[colorIndex];
  
  const svg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${safeText}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${selectedColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${selectedColor}CC;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill="url(#grad-${safeText})" rx="12"/>
      <text x="32" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" 
            font-size="28" font-weight="700" text-anchor="middle" fill="white">
        ${safeText}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}



/**
 * 获取图标的主要功能（简化版）
 * @param {string} websiteUrl - 网站URL
 * @param {string} title - 网站标题
 * @returns {Promise<Object>} - 包含图标URL和类型
 */
async function getBookmarkIcon(websiteUrl, title) {
  try {
    const urlObj = new URL(websiteUrl);
    
    // 1. 直接尝试/favicon.ico
    const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    try {
      const response = await axios.head(faviconUrl, { timeout: 5000 });
      if (response.status === 200) {
        console.log('成功获取favicon.ico:', faviconUrl);
        return {
          icon_url: faviconUrl,
          icon_type: 'favicon'
        };
      }
    } catch (error) {
      console.log('favicon.ico不存在');
    }
    
    // 2. 尝试从HTML中提取图标
    const htmlIcon = await getWebsiteIcon(websiteUrl);
    if (htmlIcon) {
      console.log('从HTML提取图标:', htmlIcon);
      return {
        icon_url: htmlIcon,
        icon_type: 'html'
      };
    }
    
    // 3. 都没找到就返回首字母图标
    console.log('使用首字母图标');
    const firstChar = getFirstChar(title);
    return {
      icon_url: generateLetterIcon(firstChar),
      icon_type: 'letter'
    };
    
  } catch (error) {
    console.error('获取图标出错:', error.message);
    const firstChar = getFirstChar(title);
    return {
      icon_url: generateLetterIcon(firstChar),
      icon_type: 'letter'
    };
  }
}

module.exports = {
  getWebsiteIcon,
  getFirstChar,
  generateLetterIcon,
  getBookmarkIcon
};