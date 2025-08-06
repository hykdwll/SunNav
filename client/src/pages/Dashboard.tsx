import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarkAPI, categoryAPI } from '../services/api';
import { Bookmark, Category } from '../types';
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    totalCategories: 0,
    totalTags: 0,
    recentBookmarks: [] as Bookmark[],
    favoriteBookmarks: [] as Bookmark[],
    topCategories: [] as Category[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [bookmarksRes, categoriesRes] = await Promise.all([
        bookmarkAPI.getBookmarks({ limit: 20 }),
        categoryAPI.getCategoryStats(),
      ]);

      const bookmarks = bookmarksRes.data;
      const categories = categoriesRes.data;

      setStats({
        totalBookmarks: bookmarks.length,
        totalCategories: categories.length,
        totalTags: 0, // 将在后续实现
        recentBookmarks: bookmarks.slice(0, 5),
        favoriteBookmarks: bookmarks.filter((b: Bookmark) => Boolean(b.is_favorite)).slice(0, 5),
        topCategories: categories.slice(0, 5),
      });
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    link?: string;
  }> = ({ title, value, icon: Icon, color, link }) => {
    const content = (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </div>
    );

    return link ? (
      <Link to={link} className="hover:shadow-md transition-shadow">
        {content}
      </Link>
    ) : content;
  };

  const BookmarkCard: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 truncate block"
          >
            {bookmark.title}
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {bookmark.url}
          </p>
          {bookmark.category_name && (
            <div className="flex items-center mt-2">
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: bookmark.category_color + '20', color: bookmark.category_color }}
              >
                {bookmark.category_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
        <p className="text-gray-600 dark:text-gray-400">欢迎使用 SunNav 书签管理器</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总书签数"
          value={stats.totalBookmarks}
          icon={BookmarkIcon}
          color="bg-blue-500"
          link="/bookmarks"
        />
        <StatCard
          title="分类数"
          value={stats.totalCategories}
          icon={FolderIcon}
          color="bg-green-500"
          link="/categories"
        />
        <StatCard
          title="标签数"
          value={stats.totalTags}
          icon={TagIcon}
          color="bg-purple-500"
          link="/tags"
        />
        <StatCard
          title="收藏数"
          value={stats.favoriteBookmarks.length}
          icon={BookmarkIcon}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近添加的书签 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">最近添加</h3>
              <Link
                to="/bookmarks"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                查看全部
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {stats.recentBookmarks.length > 0 ? (
              stats.recentBookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))
            ) : (
              <div className="text-center py-8">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">还没有书签，快去添加吧！</p>
                <Link
                  to="/bookmarks"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  添加书签
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 收藏的书签 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">收藏的书签</h3>
              <Link
                to="/bookmarks?favorite=true"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                查看全部
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {stats.favoriteBookmarks.length > 0 ? (
              stats.favoriteBookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))
            ) : (
              <div className="text-center py-8">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">还没有收藏的书签</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;