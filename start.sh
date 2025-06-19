#!/bin/bash

echo "启动字符编码转换器 Pro..."
echo

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误：未找到Python 3，请先安装Python 3.7+"
    exit 1
fi

echo "检查Python版本..."
python3 --version

echo "安装依赖包..."
pip3 install flask flask-cors

echo "启动后端服务..."
cd backend

echo "后端服务正在启动，请访问 http://localhost:5000"
echo "按 Ctrl+C 停止服务"

python3 app.py 