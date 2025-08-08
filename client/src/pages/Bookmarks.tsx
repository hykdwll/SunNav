import React, { useState, useEffect } from 'react';
import { bookmarkAPI, categoryAPI, tagAPI } from '../services/api';
import { Bookmark, Category, Tag } from '../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import BookmarkIcon from '../components/BookmarkIcon';

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: '',
    tags: [] as string[],
    icon_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookmarksRes, categoriesRes, tagsRes] = await Promise.all([
        bookmarkAPI.getBookmarks(),
        categoryAPI.getCategories(),
        tagAPI.getTags(),
      ]);

      setBookmarks(bookmarksRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bookmarkData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        tags: formData.tags,
      };

      if (editingBookmark) {
        await bookmarkAPI.updateBookmark(editingBookmark.id.toString(), bookmarkData);
      } else {
        await bookmarkAPI.createBookmark(bookmarkData);
      }

      setShowModal(false);
      setEditingBookmark(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      category_id: '',
      tags: [],
      icon_url: '',
    });
  };

  const fetchMetadata = async () => {
    if (!formData.url.trim()) return;

    setLoadingMetadata(true);
    try {
      const response = await fetch('/api/bookmarks/fetch-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url: formData.url })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取网页信息失败');
      }

      const metadata = await response.json();
      
      setFormData(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        icon_url: metadata.icon_url || prev.icon_url,
      }));

    } catch (error: any) {
      console.error('获取网页元数据失败:', error);
      alert(error.message || '获取网页信息失败，请手动填写');
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || '',
      category_id: bookmark.category_id?.toString() || '',
      tags: Array.isArray(bookmark.tags) 
        ? bookmark.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
        : [],
      icon_url: bookmark.icon_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个书签吗？')) {
      try {
        await bookmarkAPI.deleteBookmark(id.toString());
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.error || '删除失败');
      }
    }
  };

  const toggleFavorite = async (bookmark: Bookmark) => {
    try {
      await bookmarkAPI.toggleFavorite(bookmark.id.toString());
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchQuery === '' || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || 
      bookmark.category_id?.toString() === selectedCategory;

    const matchesTag = selectedTag === '' ||
      (Array.isArray(bookmark.tags) && bookmark.tags.some(tag => 
        typeof tag === 'string' ? tag === selectedTag : tag.name === selectedTag
      ));

    return matchesSearch && matchesCategory && matchesTag;
  });

  const BookmarkCard: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <BookmarkIcon iconUrl={bookmark.icon_url} title={bookmark.title} />
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-primary-600 hover:text-primary-500 block truncate"
            onClick={() => bookmarkAPI.incrementClick(bookmark.id.toString())}
          >
            {bookmark.title}
          </a>
          {bookmark.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {bookmark.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => toggleFavorite(bookmark)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="收藏"
          >
            {bookmark.is_favorite ? (
              <SolidStarIcon className="h-4 w-4 text-yellow-500" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => handleEdit(bookmark)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="编辑"
          >
            <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleDelete(bookmark.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="删除"
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setEditingBookmark(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          添加书签
        </button>
      </div>

          {/* 搜索框 */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索书签..."
                    className="pl-10 input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">所有分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  className="input"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value="">所有标签</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 书签列表 */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div>
              {filteredBookmarks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredBookmarks.map(bookmark => (
                    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SolidStarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? '没有找到匹配的书签' : '暂无书签'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 添加/编辑书签模态框 */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingBookmark ? '编辑书签' : '添加书签'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingBookmark(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      标题 *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      URL *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        required
                        className="input flex-1"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://example.com"
                      />
                      <button
                        type="button"
                        onClick={fetchMetadata}
                        disabled={!formData.url || loadingMetadata}
                        className="btn btn-secondary px-3 py-2 text-sm whitespace-nowrap disabled:opacity-50"
                      >
                        {loadingMetadata ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          '自动填充'
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      描述
                    </label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      分类
                    </label>
                    <select
                      className="input"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">无分类</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      网站图标地址
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        className="input flex-1"
                        placeholder="https://example.com/favicon.ico"
                        value={formData.icon_url || ''}
                        onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.url) {
                            fetchMetadata();
                          }
                        }}
                        disabled={!formData.url || loadingMetadata}
                        className="btn btn-secondary px-3 py-2 text-sm whitespace-nowrap disabled:opacity-50"
                        title="从网站自动获取图标"
                      >
                        {loadingMetadata ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          '🏷️'
                        )}
                      </button>
                    </div>
                    {formData.icon_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.icon_url} 
                          alt="图标预览"
                          className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#9CA3AF" rx="6"/><text x="16" y="20" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="white">?</text></svg>`)}`;
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      标签（用逗号分隔）
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="例如：工作,学习,工具"
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                      })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-secondary"
                    >
                      取消
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingBookmark ? '更新' : '添加'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;