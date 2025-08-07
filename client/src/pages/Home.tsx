import React, { useState, useEffect, useRef } from 'react';
import BookmarkIcon from '../components/BookmarkIcon';
import ContextMenu from '../components/ContextMenu';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  EllipsisHorizontalIcon,
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
  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 右键菜单相关状态
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchBookmarks();
    fetchAllBookmarks();
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
        console.log('获取到的书签数据:', data);
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

  const fetchAllBookmarks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAllBookmarks([]);
      setFilteredBookmarks([]);
      return;
    }

    try {
      const response = await fetch('/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllBookmarks(data);
        setFilteredBookmarks(data);
      } else {
        setAllBookmarks([]);
        setFilteredBookmarks([]);
      }
    } catch (error) {
      console.error('获取所有书签失败:', error);
      setAllBookmarks([]);
      setFilteredBookmarks([]);
    }
  };

  // 处理右键菜单显示
  const handleContextMenu = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedBookmark(bookmark);
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setShowContextMenu(false);
    setSelectedBookmark(null);
  };

  // 编辑书签
  const handleEditBookmark = () => {
    if (selectedBookmark) {
      // 这里可以实现编辑书签的逻辑，例如打开编辑模态框
      alert(`编辑书签: ${selectedBookmark.title}`);
    }
  };

  // 切换收藏状态
  const toggleFavorite = async () => {
    if (selectedBookmark) {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`/api/bookmarks/${selectedBookmark.id}/favorite`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_favorite: !selectedBookmark.is_favorite
          })
        });

        if (response.ok) {
          // 更新书签列表中的收藏状态
          setBookmarks(bookmarks.map(bookmark => 
            bookmark.id === selectedBookmark.id
              ? { ...bookmark, is_favorite: !selectedBookmark.is_favorite }
              : bookmark
          ));
        }
      } catch (error) {
        console.error('更新收藏状态失败:', error);
      }
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

  // Removed unused getFaviconUrl function


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-start pt-32 p-4 relative">
      <ContextMenu
        isOpen={showContextMenu}
        position={contextMenuPosition}
        onClose={closeContextMenu}
        onEdit={handleEditBookmark}
        onFavorite={toggleFavorite}
        isFavorite={selectedBookmark?.is_favorite || false}
      />
      {/* 右上角菜单区域 */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        {/* 更多图标 - 所有书签 */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => {
              setShowMoreMenu(!showMoreMenu);
              setShowUserMenu(false); // 关闭用户菜单
              setBookmarkSearchQuery('');
              setFilteredBookmarks(allBookmarks);
            }}
            className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
          
          {showMoreMenu && (
            <div className="absolute top-full right-0 mt-2 w-[500px] max-h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索书签..."
                    value={bookmarkSearchQuery}
                    className="w-full pl-10 pr-4 py-3 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onChange={(e) => {
                      const query = e.target.value;
                      setBookmarkSearchQuery(query);
                      const searchTerm = query.toLowerCase();
                      if (searchTerm.trim() === '') {
                        setFilteredBookmarks(allBookmarks);
                      } else {
                        setFilteredBookmarks(
                          allBookmarks.filter(bookmark => 
                            bookmark.title.toLowerCase().includes(searchTerm) ||
                            bookmark.url.toLowerCase().includes(searchTerm)
                          )
                        );
                      }
                    }}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-4">
                {(filteredBookmarks || allBookmarks).length > 0 ? (
                  <div>
                    {(() => {
                      const bookmarksToDisplay = filteredBookmarks || allBookmarks;
                      const groupedBookmarks = bookmarksToDisplay.reduce((acc, bookmark) => {
                        const category = bookmark.category_name || '未分类';
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(bookmark);
                        return acc;
                      }, {} as Record<string, Bookmark[]>);
                      
                      const sortedCategories = Object.keys(groupedBookmarks).sort();
                      
                      return sortedCategories.map(category => (
                        <div key={category} className="mb-6 last:mb-0">
                          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 px-4 text-left">
                            {category}
                          </h3>
                          <div className="grid grid-cols-4 gap-8 px-4">
                            {groupedBookmarks[category].map((bookmark) => (
                              <a
                                key={bookmark.id}
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 group"
                                onClick={() => setShowMoreMenu(false)}
                              >
                                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 shadow-md">
                                  <BookmarkIcon iconUrl={bookmark.icon_url} title={bookmark.title} size="lg" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-2 w-20 px-1 break-all leading-tight h-10 flex items-center justify-center">
                                  {bookmark.title}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      {isLoggedIn ? '暂无书签' : '请先登录查看书签'}
                    </p>
                    {!isLoggedIn && (
                      <a
                        href="/login"
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        onClick={() => setShowMoreMenu(false)}
                      >
                        前往登录
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 用户头像菜单 */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowMoreMenu(false); // 关闭更多菜单
            }}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white font-semibold"
          >
            <UserIcon className="h-5 w-5" />
          </button>
          
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-20">
              {isLoggedIn ? (
                <>
                  <a
                    href="/bookmarks"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>管理书签</span>
                  </a>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      setIsLoggedIn(false);
                      setShowBookmarks(false);
                      setBookmarks([]);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>登录</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>


      {/* 主要内容区域 */}
      <div className="w-full max-w-2xl mt-[30px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            SunNav
          </h1>
          {/* 移除智能搜索导航文字 */}
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
              按 <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> 键快速聚焦搜索
            </span>
          </div>
        </form>

        {/* 书签展示区域 - 只显示收藏的书签 */}
        {(() => {
          const favoriteBookmarks = bookmarks.filter(bookmark => bookmark.is_favorite);
          return showBookmarks && favoriteBookmarks.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-left">
                我的收藏
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favoriteBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="relative group"
                    onContextMenu={(e) => handleContextMenu(e, bookmark)}
                  >
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 w-full"
                      onClick={(e) => {
                        fetch(`/api/bookmarks/${bookmark.id}/click`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        }).catch(console.error);
                      }}
                    >
                      <BookmarkIcon iconUrl={bookmark.icon_url} title={bookmark.title} size="md" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-2 truncate max-w-full text-left group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {bookmark.title}
                      </h3>
                    </a>
                    <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">
                      ★
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {loadingBookmarks && (
          <div className="mt-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">加载书签中...</p>
          </div>
        )}

      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2025 SunNav - | 二阳, 💻
          <a href="https://www.eryang.top" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-1">
            作者博客
          </a>
        </p>
      </div>
    </div>
  );
};

export default Home;