import React, { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  LinkIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  param: string;
  icon: string;
  placeholder: string;
  color: string;
}

const searchEngines: SearchEngine[] = [
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s',
    param: 'wd',
    icon: '🔍',
    placeholder: '百度一下，你就知道',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search',
    param: 'q',
    icon: '🔍',
    placeholder: 'Google Search',
    color: 'from-blue-400 to-blue-500'
  },
  {
    id: 'bing',
    name: '必应',
    url: 'https://www.bing.com/search',
    param: 'q',
    icon: '🔍',
    placeholder: '微软必应搜索',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'sogou',
    name: '搜狗',
    url: 'https://www.sogou.com/web',
    param: 'query',
    icon: '🔍',
    placeholder: '搜狗搜索',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: '360',
    name: '360搜索',
    url: 'https://www.so.com/s',
    param: 'q',
    icon: '🔍',
    placeholder: '360搜索',
    color: 'from-green-600 to-green-700'
  }
];

interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  icon_url?: string;
  click_count: number;
  is_favorite: boolean;
  category_name?: string;
  tags: string[];
}

const Home: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(searchEngines[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    fetchBookmarks();
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowBookmarks(false);
      setBookmarks([]);
      return;
    }

    setLoadingBookmarks(true);
    try {
      const response = await fetch('/api/bookmarks?limit=12', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.slice(0, 12));
        setShowBookmarks(true);
      } else {
        setShowBookmarks(false);
        setBookmarks([]);
      }
    } catch (error) {
      console.error('获取书签失败:', error);
      setShowBookmarks(false);
      setBookmarks([]);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = `${selectedEngine.url}?${selectedEngine.param}=${encodeURIComponent(searchQuery.trim())}`;
      window.location.href = searchUrl;
    }
  };

  const handleEngineSelect = (engine: SearchEngine) => {
    setSelectedEngine(engine);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-start pt-32 p-4 relative">
      {/* 右上角按钮区域 */}
      <div className="absolute top-4 right-4 z-50 flex space-x-2">
        <a
          href="/bookmarks"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <CogIcon className="h-4 w-4" />
          <span>管理</span>
        </a>
        {isLoggedIn ? (
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
              setShowBookmarks(false);
              setBookmarks([]);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <UserIcon className="h-4 w-4" />
            <span>退出</span>
          </button>
        ) : (
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <UserIcon className="h-4 w-4" />
            <span>登录</span>
          </a>
        )}
      </div>


      {/* 主要内容区域 */}
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            SunNav
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            智能搜索导航
          </p>
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            {/* 搜索引擎选择器 */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedEngine.name}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </button>

                {/* 下拉菜单 */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-20">
                    {searchEngines.map((engine) => (
                      <button
                        key={engine.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleEngineSelect(engine)}
                      >
                        {engine.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 搜索输入框 */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={selectedEngine.placeholder}
              className="w-full pl-32 pr-12 py-4 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* 搜索按钮 */}
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gradient-to-r ${selectedEngine.color} text-white hover:shadow-lg transition-all duration-200`}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 快捷键提示 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> 键快速聚焦搜索框
            </span>
          </div>
        </form>

        {/* 书签展示区域 */}
        {showBookmarks && bookmarks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
              我的书签
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bookmarks.map((bookmark) => (
                <a
                  key={bookmark.id}
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex flex-col items-center text-center"
                  onClick={() => {
                    fetch(`/api/bookmarks/${bookmark.id}/click`, {
                      method: 'PATCH',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      }
                    }).catch(console.error);
                  }}
                >
                  {bookmark.icon_url ? (
                    <img 
                      src={bookmark.icon_url} 
                      alt="" 
                      className="w-8 h-8 mb-2 rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFaviconUrl(bookmark.url);
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 mb-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {bookmark.title}
                  </h3>
                  {bookmark.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}
                  {bookmark.category_name && (
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {bookmark.category_name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {loadingBookmarks && (
          <div className="mt-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">加载书签中...</p>
          </div>
        )}

      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> 键快速聚焦搜索框
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 SunNav - 智能搜索导航 | 
            <a href="https://www.eryang.top" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-1">
              作者博客
            </a>
          </p>
        </div>
    </div>
  );
};

export default Home;