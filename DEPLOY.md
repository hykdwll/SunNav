# Vercel部署指南

## 快速部署

### 1. 准备工作
确保项目已推送到GitHub仓库。

### 2. 部署到Vercel

#### 方法一：使用Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 方法二：使用Vercel网站
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入GitHub仓库
4. 配置环境变量（见下文）
5. 点击 "Deploy"

### 3. 环境变量配置

在Vercel控制台中设置以下环境变量：

#### 必需的环境变量：
- `JWT_SECRET`: 生成安全的JWT密钥（至少32位）
- `DB_HOST`: MySQL数据库主机地址
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称
- `DB_PORT`: 数据库端口（通常是3306）

#### 示例：
```bash
# 生成JWT密钥（在本地终端执行）
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. 数据库配置

确保MySQL数据库：
- 允许外部连接（配置防火墙）
- 用户有远程访问权限
- 数据库已创建

### 5. 部署验证

部署完成后：
- 访问 `https://your-project.vercel.app`
- 测试注册/登录功能
- 测试书签添加功能

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库主机是否允许外部连接
   - 确认防火墙设置
   - 验证用户名和密码

2. **JWT验证失败**
   - 确保JWT_SECRET已正确设置
   - 检查token格式

3. **构建失败**
   - 检查Node.js版本（需要22.x）
   - 确认所有依赖已安装

### 调试命令
```bash
# 查看部署日志
vercel logs

# 本地测试生产环境
npm run build
NODE_ENV=production node server.js
```

## 生产环境优化

### 性能优化
- 启用数据库连接池
- 配置CDN缓存
- 使用压缩

### 安全优化
- 使用HTTPS
- 配置CORS
- 限制API访问频率

## 联系支持

如有问题，请检查：
- Vercel部署日志
- 数据库连接状态
- 环境变量配置