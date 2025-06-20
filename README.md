# 字符编码转换器

现代化的字符编码转换工具，支持多种编码格式的转换和可视化分析。

## ✨ 特性

- 🎨 **Vue3现代化界面** - 使用最新技术栈构建的响应式界面
- 🔧 **经典HTML界面** - 兼容性良好的传统界面
- 📊 **可视化分析** - 编码数据的图表化展示
- 🐳 **Docker部署** - 一键构建和部署
- 🌐 **多端口服务** - 同时提供多个访问端口
- ⚙️ **全局配置** - 统一的API地址管理

## 🏗️ 项目结构

```
encoding_converter/
├── backend/                 # Flask后端API
├── frontend/               # 经典HTML前端
├── frontend-vue/          # Vue3现代化前端
├── config.js              # 全局配置文件
├── build.sh               # 构建脚本
├── run.sh                 # 运行脚本
├── Dockerfile.fast        # 快速构建Docker文件
└── requirements.txt       # Python依赖
```

## 🚀 快速开始

### 方法1: 一键运行（推荐）

```bash
# 赋予执行权限
chmod +x run.sh

# 一键构建并运行
./run.sh
```

### 方法2: 手动构建

```bash
# 1. 构建项目
chmod +x build.sh
./build.sh

# 2. 运行容器
docker run -d \
  --name encoding-converter \
  -p 15000:15000 \
  -p 15001:15001 \
  -p 15002:15002 \
  encoding-converter
```

## 🌐 访问地址

构建完成后，可以通过以下地址访问：

- **Vue现代化界面**: http://localhost:15001
- **API + 原版HTML**: http://localhost:15000  
- **纯原版HTML**: http://localhost:15002

## ⚙️ 配置管理

### 全局API配置

项目使用统一的配置文件 `config.js` 管理API地址：

```javascript
window.GLOBAL_CONFIG = {
  API: {
    DEVELOPMENT: 'http://localhost:15000/api',
    PRODUCTION: 'http://117.72.15.209:15000/api',
    CURRENT: 'http://117.72.15.209:15000/api'  // 当前使用的API地址
  }
}
```

### 修改API地址

#### 方法1: 直接修改配置文件
编辑 `config.js` 中的 `CURRENT` 地址

#### 方法2: 使用自动化脚本
```bash
# Windows
.\update-api-config.ps1 "http://新地址:15000"

# Linux/macOS
./update-api-config.sh "http://新地址:15000"
```

#### 方法3: 在浏览器控制台动态切换
```javascript
// 切换到开发环境
window.useDevApi()

// 切换到生产环境  
window.useProdApi()

// 设置自定义地址
window.setApiUrl('http://自定义地址:15000/api')
```

## 🛠️ 开发环境

### 本地开发Vue项目

```bash
cd frontend-vue
npm install
npm run dev
```

### 本地运行后端API

```bash
cd backend
pip install -r ../requirements.txt
python app.py
```

## 📦 Docker管理

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs encoding-converter

# 停止容器
docker stop encoding-converter

# 删除容器
docker rm encoding-converter

# 删除镜像
docker rmi encoding-converter
```

## 🔧 技术栈

### 前端
- **Vue3** + **TypeScript** + **Vite**
- **Element Plus** UI组件库
- **Chart.js** 数据可视化
- **Font Awesome** 图标库

### 后端
- **Flask** Web框架
- **Python 3.11**
- 多种字符编码支持

### 部署
- **Docker** 容器化部署
- **Nginx** 静态文件服务
- **多端口服务** 架构

## 📈 性能优化

- ✅ **预构建** - Vue项目在本地构建，减少Docker构建时间
- ✅ **分层缓存** - Docker分层构建，提高构建效率
- ✅ **静态文件分离** - 静态资源独立服务
- ✅ **API缓存** - 合理的API响应缓存

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License 