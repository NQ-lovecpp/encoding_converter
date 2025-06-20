#!/bin/bash

# 字符编码转换器 - 离线构建脚本
# 解决网络超时问题的离线构建方案

set -e

echo "🚀 开始离线构建字符编码转换器..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 创建临时目录用于存储依赖包
WHEELS_DIR="./wheels"
mkdir -p $WHEELS_DIR

echo -e "${BLUE}📦 步骤1: 构建Vue项目...${NC}"
cd frontend-vue

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⏳ 安装Vue项目依赖...${NC}"
    npm install
fi

# 构建Vue项目
echo -e "${YELLOW}⏳ 构建Vue项目...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Vue项目构建成功${NC}"
else
    echo -e "${RED}❌ Vue项目构建失败${NC}"
    exit 1
fi

# 返回根目录
cd ..

# 步骤2: 下载Python依赖包到本地
echo -e "${BLUE}📦 步骤2: 下载Python依赖包...${NC}"
echo -e "${YELLOW}⏳ 正在下载所有Python依赖包到本地...${NC}"

# 创建虚拟环境来下载包
python3 -m venv temp_venv
source temp_venv/bin/activate

# 升级pip
pip install --upgrade pip

# 下载所有依赖包到wheels目录
pip download -r requirements.txt -d $WHEELS_DIR

# 退出虚拟环境并删除
deactivate
rm -rf temp_venv

echo -e "${GREEN}✅ 依赖包下载完成${NC}"

# 步骤3: 使用离线Dockerfile构建
echo -e "${BLUE}📦 步骤3: 构建Docker镜像 (离线模式)...${NC}"
echo -e "${YELLOW}⏳ 正在构建Docker镜像 encoding-converter...${NC}"

# 创建离线Dockerfile
cat > Dockerfile.offline << 'EOF'
# 离线构建Dockerfile - 使用本地下载的包
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制本地下载的包
COPY wheels/ ./wheels/

# 复制Python依赖文件
COPY requirements.txt .

# 离线安装Python依赖
RUN pip install --upgrade pip && \
    pip install --no-index --find-links ./wheels -r requirements.txt

# 复制应用代码
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# 复制预构建的Vue项目
COPY frontend-vue/dist/ ./frontend-vue/dist/

# 复制全局配置
COPY config.js ./

# 清理wheels目录以减小镜像大小
RUN rm -rf ./wheels

# 设置环境变量
ENV PYTHONPATH=/app
ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production

# 暴露端口
EXPOSE 15000 15001 15002

# 启动命令
CMD ["python", "backend/app.py"]
EOF

# 使用离线Dockerfile构建
docker build -t encoding-converter -f Dockerfile.offline .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker镜像构建成功${NC}"
else
    echo -e "${RED}❌ Docker镜像构建失败${NC}"
    exit 1
fi

# 步骤4: 清理临时文件
echo -e "${BLUE}🧹 步骤4: 清理临时文件...${NC}"
rm -rf $WHEELS_DIR
rm -f Dockerfile.offline
docker system prune -f

echo -e "${GREEN}🎉 离线构建完成！${NC}"
echo -e "${BLUE}📝 使用方法:${NC}"
echo -e "   ${YELLOW}启动容器:${NC} docker run -d -p 15000:15000 -p 15001:15001 -p 15002:15002 encoding-converter"
echo -e "   ${YELLOW}或使用运行脚本:${NC} ./run.sh"

echo -e "${BLUE}🌐 访问地址:${NC}"
echo -e "   ${YELLOW}Vue现代化界面:${NC} http://localhost:15001"
echo -e "   ${YELLOW}API + 原版HTML:${NC} http://localhost:15000"
echo -e "   ${YELLOW}纯原版HTML:${NC} http://localhost:15002" 