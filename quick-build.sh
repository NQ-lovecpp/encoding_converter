#!/bin/bash

echo "🚀 快速构建Docker镜像 (最小化配置)"
echo "=================================="

# 检查Vue构建
if [ ! -d "frontend-vue/dist" ]; then
    echo "📂 Vue项目未构建，正在构建..."
    cd frontend-vue
    npm install
    npm run build
    cd ..
fi

echo "🐳 使用最小化Dockerfile构建..."
docker build -f Dockerfile.minimal -t encoding-converter:quick .

if [ $? -eq 0 ]; then
    echo "✅ 构建成功!"
    echo "🚀 启动命令: docker run -d -p 15000:15000 --name encoding-converter encoding-converter:quick"
else
    echo "❌ 构建失败!"
    echo "💡 建议: 检查网络连接，或者稍后重试"
fi 