# 🚀 字符编码转换器 Pro - 多服务架构

## 📋 服务概览

本项目现在提供三个独立的Web服务：

| 服务类型 | 端口 | 描述 | 技术栈 |
|---------|------|------|--------|
| 🔧 **API服务** | 15000 | 后端API接口 | Flask + Python |
| ⚡ **Vue应用** | 15001 | 现代化前端界面 | Vue 3 + TypeScript + Vite |
| 🌐 **原版HTML** | 15002 | 传统HTML界面 | HTML + CSS + JavaScript |

## 🎯 特性对比

### Vue应用 (端口15001)
- ✅ 现代化UI设计
- ✅ 液体玻璃光标效果
- ✅ 悬浮操作按钮
- ✅ 深色主题切换
- ✅ 响应式布局
- ✅ 动画组件库
- ✅ TypeScript支持

### 原版HTML (端口15002)
- ✅ 简洁稳定界面
- ✅ 快速加载
- ✅ 兼容性好
- ✅ 功能完整

### API服务 (端口15000)
- ✅ RESTful API
- ✅ 编码转换
- ✅ 文件上传
- ✅ 编码检测
- ✅ 健康检查

## 🐳 Docker部署

### 构建镜像
```bash
docker build -t encoding-converter-pro .
```

### 运行容器
```bash
docker run -d \
  --name encoding-converter \
  -p 15000:15000 \
  -p 15001:15001 \
  -p 15002:15002 \
  encoding-converter-pro
```

### 使用docker-compose
```bash
docker-compose up -d
```

## 🌐 访问地址

### 本地开发
- **API服务**: http://localhost:15000
- **Vue应用**: http://localhost:15001  
- **原版HTML**: http://localhost:15002

### Docker容器
- **API服务**: http://localhost:15000
- **Vue应用**: http://localhost:15001
- **原版HTML**: http://localhost:15002

## 🔧 本地开发

### 启动所有服务
```bash
python start-multi-server.py
```

### 单独启动Vue开发服务器
```bash
cd frontend-vue
npm run dev
```

### 单独启动Flask服务器
```bash
python backend/app.py
```

## 📊 健康检查

所有服务都支持健康检查：

```bash
# API服务
curl http://localhost:15000/api/health

# Vue应用
curl http://localhost:15001/

# 原版HTML
curl http://localhost:15002/
```

## 🔄 API接口

### 基础路径
```
http://localhost:15000/api
```

### 主要接口
- `GET /api/health` - 健康检查
- `GET /api/encodings` - 获取支持的编码格式
- `POST /api/convert` - 文本编码转换
- `POST /api/detect` - 编码检测
- `POST /api/upload` - 文件上传

## 🏗️ 架构优势

1. **服务分离**: 三个独立服务，互不干扰
2. **技术多样性**: Vue现代化界面 + 传统HTML备选
3. **易于维护**: 单一代码库，统一部署
4. **灵活部署**: 可选择性启用不同服务
5. **向后兼容**: 保留原有HTML界面

## 🔐 生产环境注意事项

1. 建议使用反向代理(Nginx)
2. 启用HTTPS
3. 配置防火墙规则
4. 监控服务健康状态
5. 定期备份数据

## 🚨 故障排除

### 端口冲突
如果端口被占用，修改`backend/app.py`中的端口配置：
```python
api_app.run(port=15000)    # API端口
vue_app.run(port=15001)    # Vue端口  
html_app.run(port=15002)   # HTML端口
```

### Vue构建失败
确保Node.js版本 >= 16：
```bash
node --version
npm --version
```

### Docker构建失败
清理缓存重新构建：
```bash
docker system prune -a
docker build --no-cache -t encoding-converter-pro .
```

## 📞 技术支持

如有问题，请查看：
1. 服务器日志输出
2. 浏览器开发者工具
3. Docker容器日志: `docker logs encoding-converter`

---

🎉 **享受全新的多服务体验！** 