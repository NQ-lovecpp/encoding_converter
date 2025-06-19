@echo off
chcp 65001
echo 启动字符编码转换器 Pro...
echo.

echo 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误：未找到Python，请先安装Python 3.7+
    pause
    exit /b 1
)

echo 安装依赖包...
pip install flask flask-cors >nul 2>&1

echo 启动后端服务...
cd backend
echo 后端服务正在启动，请访问 http://localhost:5000
echo 按 Ctrl+C 停止服务
python app.py

pause 