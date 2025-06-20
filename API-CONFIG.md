# API配置管理

本项目已配置为使用服务器API地址：`http://117.72.15.209:15000`

## 🔧 自动配置脚本

### Windows (PowerShell)
```powershell
# 使用默认服务器地址
.\update-api-config.ps1

# 使用自定义API地址
.\update-api-config.ps1 "http://your-server.com:15000"
```

### Linux/macOS (Bash)
```bash
# 使用默认服务器地址
chmod +x update-api-config.sh
./update-api-config.sh

# 使用自定义API地址
./update-api-config.sh "http://your-server.com:15000"
```

## 📁 配置文件位置

### Vue项目
- `frontend-vue/.env` - 开发环境配置
- `frontend-vue/.env.production` - 生产环境配置
- `frontend-vue/vite.config.ts` - Vite代理配置
- `frontend-vue/src/config/api.ts` - API配置模块

### 原版HTML
- `frontend/config.js` - 全局配置文件

## 🔄 手动配置步骤

1. **更新Vue项目配置**
   ```bash
   # 编辑环境变量文件
   vim frontend-vue/.env
   vim frontend-vue/.env.production
   
   # 修改API地址
   VITE_API_BASE_URL=http://your-server.com:15000/api
   ```

2. **更新原版HTML配置**
   ```javascript
   // 编辑 frontend/config.js
   window.APP_CONFIG = {
       API_BASE_URL: 'http://your-server.com:15000/api',
       // ... 其他配置
   };
   ```

3. **重新构建Vue项目**
   ```bash
   cd frontend-vue
   npm run build
   ```

4. **重启服务器**
   ```bash
   python backend/app.py
   ```

## 🌐 访问地址

配置完成后，可通过以下地址访问：

- **Vue现代化界面**: http://your-server.com:15001
- **API + 原版HTML**: http://your-server.com:15000  
- **纯原版HTML**: http://your-server.com:15002

## 🛠️ 环境变量支持

Vue项目支持通过环境变量配置API地址：

```bash
# 设置环境变量
export VITE_API_BASE_URL=http://your-server.com:15000/api

# 或在 .env 文件中配置
echo "VITE_API_BASE_URL=http://your-server.com:15000/api" > frontend-vue/.env
```

## 🔍 验证配置

检查API连接：
```bash
curl http://your-server.com:15000/api/health
```

预期响应：
```json
{
  "status": "healthy",
  "encodings_count": 30,
  "version": "2.0"
}
``` 