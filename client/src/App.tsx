import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Bookmarks from './pages/Bookmarks';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import AdminUsers from './pages/AdminUsers';
import ChangePassword from './pages/ChangePassword';
import IconTest from './pages/IconTest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
// 在入口文件（如 App.js）中添加
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Bookmarks />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tags"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Tags />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminUsers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/icon-test"
            element={
              <ProtectedRoute>
                <IconTest />
              </ProtectedRoute>
            }
          />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
