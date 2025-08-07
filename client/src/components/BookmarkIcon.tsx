import React, { useState, useEffect } from 'react';

interface BookmarkIconProps {
  iconUrl?: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ iconUrl, title, size = 'md' }) => {
  const [cachedIconUrl, setCachedIconUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const getFirstChar = (text: string) => {
    if (!text) return '?';
    const firstChar = text.trim()[0];
    return firstChar.toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl'
  };

  useEffect(() => {
    if (!iconUrl) return;

    const cacheKey = `bookmark_icon_${iconUrl}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      // 检查缓存是否过期（7天）
      const cacheData = JSON.parse(cached);
      const cacheTime = new Date(cacheData.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - cacheTime.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff < 7) {
        setCachedIconUrl(cacheData.data);
        return;
      }
    }

    // 缓存不存在或已过期，重新加载
    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // 创建canvas将图片转为base64
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataUrl = canvas.toDataURL('image/png');
        localStorage.setItem(cacheKey, JSON.stringify({
          data: dataUrl,
          timestamp: new Date().toISOString()
        }));
        setCachedIconUrl(dataUrl);
      } catch (e) {
        // 如果跨域等问题，直接使用原URL
        localStorage.setItem(cacheKey, JSON.stringify({
          data: iconUrl,
          timestamp: new Date().toISOString()
        }));
        setCachedIconUrl(iconUrl);
      }
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setCachedIconUrl(undefined);
      setIsLoading(false);
    };
    
    img.src = iconUrl;
  }, [iconUrl]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = '';
      const fallback = document.createElement('div');
      fallback.className = `${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg`;
      fallback.textContent = getFirstChar(title);
      parent.appendChild(fallback);
    }
  };

  if (cachedIconUrl || iconUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden`}>
        <img
          src={cachedIconUrl || iconUrl}
          alt={title}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-50' : ''}`}
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg`}
    >
      {getFirstChar(title)}
    </div>
  );
};

export default BookmarkIcon;