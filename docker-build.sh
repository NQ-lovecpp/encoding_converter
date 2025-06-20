#!/bin/bash

# 字符编码转换器 Pro - Docker构建脚本
# 适用于Ubuntu/Linux系统

echo "🚀 开始构建字符编码转换器 Pro"
echo "================================"

# 检查Docker是否安装（使用which命令）
if ! which docker > /dev/null 2>&1; then
    echo "❌ 错误: Docker未安装或未添加到PATH"
    exit 1
fi

# 检查docker compose是否可用
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ 错误: Docker Compose未安装或版本过低"
    echo "💡 请确保Docker Compose版本 >= 2.0"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 显示当前目录和文件
echo "📂 当前目录: $(pwd)"
echo "📋 检查关键文件:"
echo "   - Dockerfile: $([ -f Dockerfile ] && echo '✅ 存在' || echo '❌ 缺失')"
echo "   - docker-compose.yml: $([ -f docker-compose.yml ] && echo '✅ 存在' || echo '❌ 缺失')"
echo "   - frontend-vue/package.json: $([ -f frontend-vue/package.json ] && echo '✅ 存在' || echo '❌ 缺失')"

# 验证Vue项目配置
echo ""
echo "🔍 验证Vue项目配置:"
echo "   - Vue index.html脚本路径:"
grep "main.ts" frontend-vue/index.html 2>/dev/null || echo "   ❌ 未找到main.ts引用"

echo ""
echo "🔧 开始构建Docker镜像..."
echo "这可能需要几分钟时间，请耐心等待..."

# 清理旧的镜像和容器（可选）
echo "🧹 清理旧资源..."
docker compose down 2>/dev/null || true
docker rmi encoding-converter-pro 2>/dev/null || true

# 构建镜像
echo "🛠️ 构建新镜像..."
if docker compose build --no-cache; then
    echo "✅ Docker镜像构建成功!"
    echo ""
    echo "🎉 接下来可以运行:"
    echo "   docker compose up -d"
    echo ""
    echo "🌐 服务访问地址:"
    echo "   - API服务:    http://localhost:15000"
    echo "   - Vue应用:   http://localhost:15001"
    echo "   - 原版HTML:  http://localhost:15002"
else
    echo "❌ Docker镜像构建失败!"
    echo ""
    echo "🔍 可能的解决方案:"
    echo "1. 检查网络连接"
    echo "2. 确保有足够的磁盘空间"
    echo "3. 查看详细错误信息"
    echo "4. 尝试: docker system prune -a"
    echo "5. 运行本地Vue构建测试: chmod +x quick-build-test.sh && ./quick-build-test.sh"
    exit 1
fi 