#!/bin/bash

# Vue预构建 + Docker构建脚本

echo "🏗️  使用预构建方法构建Docker镜像"
echo "=================================="

# 检查Node.js和npm
echo "📋 检查环境:"
if ! which node > /dev/null 2>&1; then
    echo "❌ Node.js未安装"
    exit 1
fi

if ! which npm > /dev/null 2>&1; then
    echo "❌ npm未安装"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 进入Vue项目目录
echo ""
echo "📂 进入Vue项目目录..."
cd frontend-vue

# 检查项目文件
echo "📋 检查Vue项目文件:"
echo "   - package.json: $([ -f package.json ] && echo '✅' || echo '❌')"
echo "   - src/main.ts: $([ -f src/main.ts ] && echo '✅' || echo '❌')"
echo "   - index.html: $([ -f index.html ] && echo '✅' || echo '❌')"

# 清理旧构建
echo ""
echo "🧹 清理旧构建..."
rm -rf dist/
rm -rf node_modules/

# 安装依赖
echo ""
echo "📦 安装Vue项目依赖..."
if npm ci; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建Vue项目
echo ""
echo "🔨 构建Vue项目..."
if npm run build; then
    echo "✅ Vue项目构建成功!"
    echo "📊 dist目录内容:"
    ls -la dist/
else
    echo "❌ Vue项目构建失败!"
    echo "💡 请检查Vue项目配置"
    exit 1
fi

# 返回项目根目录
cd ..

# 构建Docker镜像
echo ""
echo "🐳 构建Docker镜像..."

# 设置Docker构建参数，增加网络超时配置
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# 使用简化版Dockerfile构建，增加网络配置
if docker build \
    --network=host \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --build-arg PIP_DEFAULT_TIMEOUT=300 \
    --build-arg PIP_RETRIES=10 \
    -f Dockerfile.simple \
    -t encoding-converter-simple:latest \
    . ; then
    echo "✅ Docker镜像构建成功!"
    echo ""
    echo "🎉 构建完成! 您可以使用以下命令启动:"
    echo "   docker run -d -p 15000:15000 -p 15001:15001 -p 15002:15002 --name encoding-converter encoding-converter-simple:latest"
    echo ""
    echo "📊 镜像信息:"
    docker images | grep encoding-converter-simple | head -1
else
    echo "❌ Docker镜像构建失败!"
    echo ""
    echo "🔧 故障排除建议:"
    echo "1. 检查网络连接是否正常"
    echo "2. 尝试使用代理或镜像源"
    echo "3. 重新运行构建命令"
    echo "4. 检查 requirements.txt 是否有冲突的依赖"
    exit 1
fi 