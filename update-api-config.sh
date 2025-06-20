#!/bin/bash

# API配置更新脚本
# 用法: ./update-api-config.sh [新的API地址]

DEFAULT_API_URL="http://117.72.15.209:15000"
NEW_API_URL=${1:-$DEFAULT_API_URL}

echo "🔧 更新API配置到: $NEW_API_URL"

# 更新Vue项目配置
echo "📱 更新Vue项目配置..."
sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$NEW_API_URL/api|g" frontend-vue/.env
sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=$NEW_API_URL/api|g" frontend-vue/.env.production

# 更新前端JavaScript配置
echo "🌐 更新原版HTML配置..."
sed -i "s|API_BASE_URL: '[^']*'|API_BASE_URL: '$NEW_API_URL/api'|g" frontend/config.js

# 更新Vite代理配置
echo "⚙️ 更新Vite代理配置..."
sed -i "s|target: '[^']*'|target: '$NEW_API_URL'|g" frontend-vue/vite.config.ts

echo "✅ API配置更新完成!"
echo "🔄 请重新构建Vue项目: cd frontend-vue && npm run build"
echo "🚀 然后重启服务器以应用更改" 