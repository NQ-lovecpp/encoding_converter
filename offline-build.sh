#!/bin/bash

echo "📦 离线Docker构建方案"
echo "==================="

# 检查Python环境
if ! which python3 > /dev/null 2>&1; then
    echo "❌ Python3未安装"
    exit 1
fi

# 步骤1: 下载依赖包
echo "🔽 步骤1: 下载Python依赖包到本地..."
python3 download-wheels.py

if [ $? -ne 0 ]; then
    echo "❌ 依赖包下载失败"
    echo "💡 尝试手动下载:"
    echo "   mkdir wheels"
    echo "   pip download --dest wheels Flask==3.0.0 Flask-CORS==4.0.0 chardet==5.2.0 requests==2.31.0"
    exit 1
fi

# 检查wheels目录
if [ ! -d "wheels" ] || [ -z "$(ls -A wheels)" ]; then
    echo "❌ wheels目录为空，尝试手动下载..."
    mkdir -p wheels
    echo "📦 手动下载依赖包..."
    pip download --dest wheels Flask==3.0.0 Flask-CORS==4.0.0 chardet==5.2.0 requests==2.31.0
    
    if [ $? -ne 0 ]; then
        echo "❌ 手动下载也失败了"
        echo "💡 建议检查网络连接或稍后重试"
        exit 1
    fi
fi

# 步骤2: 构建Vue项目
echo ""
echo "🔨 步骤2: 构建Vue项目..."
if [ ! -d "frontend-vue/dist" ]; then
    cd frontend-vue
    npm install --prefer-offline
    npm run build
    cd ..
    
    if [ ! -d "frontend-vue/dist" ]; then
        echo "❌ Vue项目构建失败"
        exit 1
    fi
fi

# 步骤3: 构建Docker镜像
echo ""
echo "🐳 步骤3: 使用离线方式构建Docker镜像..."
docker build -f Dockerfile.offline -t encoding-converter:offline .

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 离线构建成功!"
    echo "🚀 启动命令:"
    echo "   docker run -d -p 15000:15000 --name encoding-converter encoding-converter:offline"
    echo ""
    echo "📊 镜像信息:"
    docker images | grep encoding-converter:offline | head -1
    
    # 清理wheels目录（可选）
    echo ""
    echo "🧹 清理临时文件..."
    rm -rf wheels/
    echo "✅ 临时文件已清理"
else
    echo "❌ Docker构建失败!"
    echo "💡 请检查Dockerfile.offline和相关文件"
    exit 1
fi 