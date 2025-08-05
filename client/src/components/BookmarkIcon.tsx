import React from 'react';

interface BookmarkIconProps {
  iconUrl?: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ iconUrl, title, size = 'md' }) => {
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
      <img
        src={iconUrl}
        alt={title}
        className={`${sizeClasses[size]} rounded-lg object-cover border border-gray-200 dark:border-gray-600`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
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