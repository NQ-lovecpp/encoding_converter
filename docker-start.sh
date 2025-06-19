#!/bin/bash

# 字符编码转换器 Pro - Docker启动脚本
# 适用于Ubuntu/Linux系统

echo "🚀 启动字符编码转换器 Pro"
echo "=============================="

# 启动服务
echo "📡 启动所有服务..."
if docker compose up -d; then
    echo "✅ 服务启动成功!"
    
    echo ""
    echo "⏳ 等待服务完全启动..."
    sleep 10
    
    echo ""
    echo "🔍 检查服务状态:"
    docker compose ps
    
    echo ""
    echo "🌐 服务访问地址:"
    echo "================================"
    echo "🔧 API服务:      http://localhost:15000"
    echo "⚡ Vue应用:     http://localhost:15001"
    echo "🌐 原版HTML:    http://localhost:15002"
    echo "================================"
    
    echo ""
    echo "🧪 健康检查:"
    echo "API服务健康状态:"
    if curl -s http://localhost:15000/api/health > /dev/null; then
        echo "✅ API服务运行正常"
    else
        echo "⚠️  API服务可能还在启动中..."
    fi
    
    echo ""
    echo "📋 有用的命令:"
    echo "   查看日志: docker compose logs -f"
    echo "   停止服务: docker compose down"
    echo "   重启服务: docker compose restart"
    
else
    echo "❌ 服务启动失败!"
    echo ""
    echo "🔍 请检查:"
    echo "1. Docker镜像是否已构建: docker images | grep encoding-converter"
    echo "2. 端口是否被占用: netstat -tlnp | grep -E ':(15000|15001|15002)'"
    echo "3. 查看详细日志: docker compose logs"
    exit 1
fi 