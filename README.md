# SunNav

一个现代化的智能搜索导航网站，帮助用户快速访问常用网站和书签，支持书签管理和个性化搜索体验。

## 🌟 功能特性

### 核心功能
- **智能搜索**：支持多个搜索引擎的快速切换
- **书签管理**：添加、编辑、删除、分类管理书签
- **标签系统**：为书签添加标签，便于分类和搜索
- **收藏功能**：收藏重要书签，快速访问
- **图标识别**：自动获取网站图标，视觉识别更直观
- **响应式设计**：完美适配桌面端和移动端

### 用户功能
- **用户认证**：注册、登录、退出系统
- **个性化**：自定义搜索引擎偏好
- **数据同步**：登录后书签数据云端同步
- **快捷操作**：支持键盘快捷键（按/键快速聚焦搜索框）

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 原子化CSS框架
- **Heroicons** - 精美的图标库
- **Axios** - HTTP客户端

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **MySQL** - 关系型数据库
- **JWT** - 用户认证
- **Bcrypt** - 密码加密

### 部署
- **Vercel** - 前端部署
- **数据库** - 支持PlanetScale、Railway等云数据库

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 5.7+
- npm或yarn包管理器

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/yourusername/SunNav.git
cd SunNav
```

2. **安装依赖**
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

3. **环境配置**

创建`.env`文件：
```env
# 数据库配置
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=sunnav
DB_PORT=3306

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 端口配置
PORT=3000
```

4. **数据库初始化**
```bash
# 导入数据库结构
mysql -u your_username -p sunnav < database/schema.sql

# 初始化管理员账户
npm run init-admin
```

5. **启动开发服务器**

```bash
# 启动后端服务器
npm run dev

# 启动前端开发服务器（新终端）
cd client
npm start
```

访问 http://localhost:3000 开始使用