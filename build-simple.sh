#!/bin/bash

# 字符编码转换器 - 简单构建脚本
# 使用预构建基础镜像，最小化网络依赖

set -e

echo "🚀 开始简单构建字符编码转换器..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤1: 构建Vue项目
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

# 步骤2: 创建简化的Dockerfile
echo -e "${BLUE}📦 步骤2: 创建简化的Docker配置...${NC}"

cat > Dockerfile.simple << 'EOF'
# 简单构建Dockerfile - 使用预构建镜像
FROM tiangolo/uwsgi-nginx-flask:python3.11

# 设置工作目录
WORKDIR /app

# 安装最少必要的依赖
RUN pip install --upgrade pip && \
    pip install Flask==3.0.0 Flask-CORS==4.0.0 chardet==5.2.0

# 复制应用代码
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# 复制预构建的Vue项目
COPY frontend-vue/dist/ ./frontend-vue/dist/

# 复制全局配置
COPY config.js ./

# 设置环境变量
ENV PYTHONPATH=/app
ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production

# 暴露端口
EXPOSE 15000 15001 15002

# 创建启动脚本
RUN echo '#!/bin/bash\npython backend/app.py' > /app/start.sh && \
    chmod +x /app/start.sh

# 启动命令
CMD ["/app/start.sh"]
EOF

# 步骤3: 构建Docker镜像
echo -e "${BLUE}📦 步骤3: 构建Docker镜像 (简单模式)...${NC}"
echo -e "${YELLOW}⏳ 正在构建Docker镜像 encoding-converter...${NC}"

docker build -t encoding-converter -f Dockerfile.simple .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker镜像构建成功${NC}"
else
    echo -e "${RED}❌ Docker镜像构建失败${NC}"
    exit 1
fi

# 步骤4: 清理临时文件
echo -e "${BLUE}🧹 步骤4: 清理临时文件...${NC}"
rm -f Dockerfile.simple
docker system prune -f

echo -e "${GREEN}🎉 简单构建完成！${NC}"
echo -e "${BLUE}📝 使用方法:${NC}"
echo -e "   ${YELLOW}启动容器:${NC} docker run -d -p 15000:15000 -p 15001:15001 -p 15002:15002 encoding-converter"
echo -e "   ${YELLOW}或使用运行脚本:${NC} ./run.sh"

echo -e "${BLUE}🌐 访问地址:${NC}"
echo -e "   ${YELLOW}Vue现代化界面:${NC} http://localhost:15001"
echo -e "   ${YELLOW}API + 原版HTML:${NC} http://localhost:15000"
echo -e "   ${YELLOW}纯原版HTML:${NC} http://localhost:15002" 