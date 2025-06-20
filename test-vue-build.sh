#!/bin/bash

# Vue项目构建测试脚本

echo "🧪 测试Vue项目本地构建"
echo "========================"

cd frontend-vue

# 检查Node.js版本
echo "📋 检查Node.js环境:"
node --version
npm --version

# 检查关键文件
echo ""
echo "📂 检查项目文件:"
echo "   - package.json: $([ -f package.json ] && echo '✅ 存在' || echo '❌ 缺失')"
echo "   - src/main.ts: $([ -f src/main.ts ] && echo '✅ 存在' || echo '❌ 缺失')"
echo "   - index.html: $([ -f index.html ] && echo '✅ 存在' || echo '❌ 缺失')"
echo "   - vite.config.ts: $([ -f vite.config.ts ] && echo '✅ 存在' || echo '❌ 缺失')"

# 清理旧的构建
echo ""
echo "🧹 清理旧构建..."
rm -rf dist/
rm -rf node_modules/

# 安装依赖
echo ""
echo "📦 安装依赖..."
if npm ci; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建项目
echo ""
echo "🔨 构建项目..."
if npm run build; then
    echo "✅ Vue项目构建成功!"
    echo ""
    echo "📊 构建结果:"
    ls -la dist/
else
    echo "❌ Vue项目构建失败!"
    exit 1
fi

echo ""
echo "🎉 本地构建测试完成!"
echo "💡 如果本地构建成功，Docker构建应该也能成功" 