#!/bin/bash

# 字符编码转换器 - 快速构建脚本
# 先构建Vue项目，再打包到Docker

set -e

echo "🚀 开始构建字符编码转换器..."

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

# 步骤2: 构建Docker镜像
echo -e "${BLUE}📦 步骤2: 构建Docker镜像...${NC}"
echo -e "${YELLOW}⏳ 正在构建Docker镜像 encoding-converter...${NC}"

docker build -t encoding-converter -f Dockerfile.fast .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker镜像构建成功${NC}"
else
    echo -e "${RED}❌ Docker镜像构建失败${NC}"
    exit 1
fi

# 步骤3: 清理构建缓存（可选）
echo -e "${BLUE}🧹 步骤3: 清理构建缓存...${NC}"
docker system prune -f

echo -e "${GREEN}🎉 构建完成！${NC}"
echo -e "${BLUE}📝 使用方法:${NC}"
echo -e "   ${YELLOW}启动容器:${NC} docker run -d -p 15000:15000 -p 15001:15001 -p 15002:15002 encoding-converter"
echo -e "   ${YELLOW}查看日志:${NC} docker logs <container_id>"
echo -e "   ${YELLOW}停止容器:${NC} docker stop <container_id>"

echo -e "${BLUE}🌐 访问地址:${NC}"
echo -e "   ${YELLOW}Vue现代化界面:${NC} http://localhost:15001"
echo -e "   ${YELLOW}API + 原版HTML:${NC} http://localhost:15000"
echo -e "   ${YELLOW}纯原版HTML:${NC} http://localhost:15002" 