import React from 'react';

interface BookmarkIconProps {
  iconUrl?: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ iconUrl, title, size = 'md' }) => {
  console.log('BookmarkIcon - iconUrl类型:', typeof iconUrl);
  console.log('BookmarkIcon - iconUrl长度:', iconUrl ? iconUrl.length : 0);
  console.log('BookmarkIcon - iconUrl开头:', iconUrl ? iconUrl.substring(0, 20) : '空');
  console.log('BookmarkIcon - iconUrl:', iconUrl);
  console.log('BookmarkIcon - title:', title);
  const getFirstChar = (text: string) => {
    if (!text) return '?';
    const firstChar = text.trim()[0];
    return firstChar.toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  if (iconUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden`}>
        <img
          src={iconUrl}
          alt={title}
          className={`w-full h-full object-cover border border-gray-200 dark:border-gray-600`}
          onError={(e) => {
            // 图片加载失败时，显示备用方案
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              parent.innerHTML = '';
              const fallback = document.createElement('div');
              fallback.className = `${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm`;
              fallback.textContent = getFirstChar(title);
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm`}
    >
      {getFirstChar(title)}
    </div>
  );
};

export default BookmarkIcon;