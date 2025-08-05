# SunNav - 智能搜索导航

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

## 📦 Vercel部署教程

### 方法1：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/SunNav)

### 方法2：手动部署

#### 步骤1：准备前端

1. **构建前端**
```bash
cd client
npm run build
```

2. **修改API地址**
在`client/src/services/api.ts`中修改：
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app';
```

#### 步骤2：部署后端到Vercel

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **创建vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "DB_HOST": "@db-host",
    "DB_USER": "@db-user",
    "DB_PASSWORD": "@db-password",
    "DB_NAME": "@db-name",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

3. **部署**
```bash
vercel --prod
```

#### 步骤3：配置环境变量

在Vercel控制台设置环境变量：
- `DB_HOST` - 数据库主机
- `DB_USER` - 数据库用户名  
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名
- `JWT_SECRET` - JWT密钥

#### 步骤4：数据库配置

**选项1：PlanetScale（推荐）**
```bash
# 安装PlanetScale CLI
brew install planetscale/tap/pscale

# 连接数据库
pscale connect sunnav main --port 3306
```

**选项2：Railway**
1. 注册Railway账号
2. 创建MySQL数据库
3. 获取连接字符串
4. 在Vercel环境变量中配置

#### 步骤5：前端部署

1. **在Vercel创建新项目**
2. **导入前端代码**
3. **设置构建命令**
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **设置环境变量**
   - `REACT_APP_API_URL`: 你的后端URL

### 验证部署

部署完成后：
1. 访问前端URL，确认界面正常
2. 测试用户注册和登录
3. 添加测试书签，确认功能正常
4. 检查数据库连接

## 🎯 使用指南

### 管理员账户
- 用户名：admin
- 密码：首次运行`npm run init-admin`时生成

### 基本操作
1. **搜索**：输入关键词，选择搜索引擎
2. **添加书签**：登录后点击"管理"进入后台
3. **快捷键**：按/键快速聚焦搜索框
4. **收藏**：点击星星图标收藏重要书签

## 📁 项目结构

```
SunNav/
├── client/                 # 前端React应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── services/      # API服务
│   │   └── types/         # TypeScript类型定义
├── routes/                # 后端路由
├── database/              # 数据库结构
├── utils/                 # 工具函数
└── scripts/               # 脚本文件
```

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建前端
npm run build

# 初始化管理员
npm run init-admin

# 重置管理员密码
npm run reset-admin

# 测试管理员登录
npm run test-admin
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**阳的树屋**
- 博客：[https://www.eryang.top](https://www.eryang.top)
- GitHub：[yourusername](https://github.com/yourusername)

## 🙏 致谢

- [Heroicons](https://heroicons.com/) - 精美的图标库
- [Tailwind CSS](https://tailwindcss.com/) - 优秀的CSS框架
- [React](https://reactjs.org/) - 强大的前端框架