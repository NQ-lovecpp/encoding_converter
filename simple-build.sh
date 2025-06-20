#!/bin/bash

echo "⚡ 超简单Docker构建 (使用预构建基础镜像)"
echo "========================================="

# 检查Vue构建
if [ ! -d "frontend-vue/dist" ]; then
    echo "📂 Vue项目未构建，正在构建..."
    cd frontend-vue
    npm install
    npm run build
    cd ..
fi

echo "🐳 使用预构建Flask基础镜像..."
docker build -f Dockerfile.simple-base -t encoding-converter:simple .

if [ $? -eq 0 ]; then
    echo "✅ 构建成功!"
    echo "🚀 启动命令: docker run -d -p 15000:15000 --name encoding-converter encoding-converter:simple"
else
    echo "❌ 构建失败!"
fi 