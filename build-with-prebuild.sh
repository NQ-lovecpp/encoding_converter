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
if docker build -f Dockerfile.simple -t encoding-converter-pro .; then
    echo "✅ Docker镜像构建成功!"
    echo ""
    echo "🎉 可以运行以下命令启动:"
    echo "   docker run -d --name encoding-converter -p 15000:15000 -p 15001:15001 -p 15002:15002 encoding-converter-pro"
    echo ""
    echo "🌐 服务访问地址:"
    echo "   - API服务:    http://localhost:15000"
    echo "   - Vue应用:   http://localhost:15001"
    echo "   - 原版HTML:  http://localhost:15002"
else
    echo "❌ Docker镜像构建失败!"
    exit 1
fi 