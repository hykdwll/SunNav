import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const ChangePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // 清除错误和成功消息
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('新密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      setSuccess('密码修改成功！');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || '密码修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <LockClosedIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">修改密码</h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              当前密码
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="请输入当前密码"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              新密码
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="请输入新密码（至少6位）"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              确认新密码
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="请再次输入新密码"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;