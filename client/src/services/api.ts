import axios from 'axios';

// 根据环境设置API基础URL
const isProduction = process.env.NODE_ENV === 'production';
// 在Vercel环境中，使用VERCEL_URL或VERCEL_BRANCH_URL
const vercelUrl = process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL;
const API_BASE_URL = process.env.REACT_APP_API_URL 
  || (isProduction && vercelUrl ? `https://${vercelUrl}/api` : '/api');

// 开发环境下打印API基础URL以便调试
if (!isProduction) {
  console.log('API_BASE_URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  verify: () => api.get('/auth/verify'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),
};

// 书签相关API
export const bookmarkAPI = {
  getBookmarks: (params?: any) => api.get('/bookmarks', { params }),
  getBookmark: (id: string) => api.get(`/bookmarks/${id}`),
  createBookmark: (data: any) => api.post('/bookmarks', data),
  updateBookmark: (id: string, data: any) => api.put(`/bookmarks/${id}`, data),
  deleteBookmark: (id: string) => api.delete(`/bookmarks/${id}`),
  toggleFavorite: (id: string) => api.patch(`/bookmarks/${id}/favorite`),
  incrementClick: (id: string) => api.patch(`/bookmarks/${id}/click`),
};

// 分类相关API
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
  getCategoryStats: () => api.get('/categories/stats'),
};

// 标签相关API
export const tagAPI = {
  getTags: () => api.get('/tags'),
  createTag: (data: any) => api.post('/tags', data),
  updateTag: (id: string, data: any) => api.put(`/tags/${id}`, data),
  deleteTag: (id: string) => api.delete(`/tags/${id}`),
  searchTags: (query: string) => api.get(`/tags/search/${query}`),
  getTagBookmarks: (id: string) => api.get(`/tags/${id}/bookmarks`),
};

export default api;