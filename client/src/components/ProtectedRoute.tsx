import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600">
          {showFallback && 
            <span className="text-sm text-gray-500 mt-4">
              加载时间过长，请检查网络连接
            </span>}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;