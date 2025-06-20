#!/bin/bash

echo "🔧 快速Vue构建测试"
echo "=================="

cd frontend-vue

echo "📋 当前目录: $(pwd)"
echo "📂 检查文件:"
echo "   - index.html: $([ -f index.html ] && echo '存在' || echo '缺失')"
echo "   - src/main.ts: $([ -f src/main.ts ] && echo '存在' || echo '缺失')"

echo ""
echo "📄 检查index.html中的脚本路径:"
grep "main.ts" index.html

echo ""
echo "🧹 清理旧构建..."
rm -rf dist/

echo ""
echo "🔨 尝试构建..."
if npm run build 2>&1; then
    echo "✅ 构建成功!"
    echo "📊 dist目录内容:"
    ls -la dist/ 2>/dev/null || echo "dist目录不存在"
else
    echo "❌ 构建失败"
    echo "💡 可能需要先运行: npm install"
fi 