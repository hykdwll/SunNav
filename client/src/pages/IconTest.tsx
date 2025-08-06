import React, { useState, useEffect } from 'react';
import BookmarkIcon from '../components/BookmarkIcon';

const IconTest: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
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
          console.log('测试页面获取到的书签数据:', data);
          setBookmarks(data);
        }
      } catch (error) {
        console.error('获取书签失败:', error);
      }

      setLoading(false);
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (bookmarks.length === 0) {
    return <div className="flex justify-center items-center h-screen">没有书签数据</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">图标测试页面</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <BookmarkIcon iconUrl={bookmark.icon_url} title={bookmark.title} size="lg" />
              <div className="ml-4">
                <h3 className="font-bold">{bookmark.title}</h3>
                <p className="text-sm text-gray-500">{bookmark.url}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium">图标URL:</p>
              <p className="text-xs text-blue-600 break-all">{bookmark.icon_url}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium">直接显示图标:</p>
              {bookmark.icon_url && (
                <img
                  src={bookmark.icon_url}
                  alt="测试图标"
                  className="w-10 h-10 mt-1"
                  onError={(e) => {
                    console.error('图标加载失败:', bookmark.icon_url);
                    const img = e.target as HTMLImageElement;
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMyMDIwMjAiIHJ4PSI2Ii8+PHBhdGggZD0iTTIwIDIySDIyVjEwaC0ydi0ySDE4djJINTh2MkgxOHYxMEgyMHpNNiA3aDR2Mkg2ek02IDEzaDR2Mkg2ek02IDE5aDR2Mkg2eiIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconTest;