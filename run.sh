#!/bin/bash

# 字符编码转换器 - 运行脚本

echo "🚀 启动字符编码转换器..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查镜像是否存在
if ! docker image inspect encoding-converter &> /dev/null; then
    echo "📦 镜像不存在，开始构建..."
    ./build.sh
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker stop encoding-converter 2>/dev/null || true
docker rm encoding-converter 2>/dev/null || true

# 启动新容器
echo "🚀 启动新容器..."
docker run -d \
    --name encoding-converter \
    -p 15000:15000 \
    -p 15001:15001 \
    -p 15002:15002 \
    encoding-converter

if [ $? -eq 0 ]; then
    echo "✅ 容器启动成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   Vue现代化界面: http://localhost:15001"
    echo "   API + 原版HTML: http://localhost:15000"
    echo "   纯原版HTML: http://localhost:15002"
    echo ""
    echo "📝 管理命令:"
    echo "   查看日志: docker logs encoding-converter"
    echo "   停止容器: docker stop encoding-converter"
    echo "   进入容器: docker exec -it encoding-converter bash"
else
    echo "❌ 容器启动失败"
    exit 1
fi 