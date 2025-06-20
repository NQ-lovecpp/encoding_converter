# 多阶段构建：先构建Vue项目，再构建Python应用
FROM node:18-alpine AS vue-builder

# 设置工作目录
WORKDIR /vue-build

# 首先复制package.json文件
COPY frontend-vue/package*.json ./

# 安装依赖
RUN npm ci

# 然后复制源代码
COPY frontend-vue/ ./

# 构建Vue项目
RUN npm run build

# 使用Python 3.11官方镜像作为基础镜像
FROM python:3.11-slim

# 设置维护者信息
LABEL maintainer="Encoding Converter Pro Team"
LABEL description="Modern Character Encoding Converter with Vue + HTML + API services"
LABEL version="3.0"

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    FLASK_APP=backend/app.py \
    FLASK_ENV=production \
    PYTHONPATH=/app

# 设置工作目录
WORKDIR /app

# 安装系统依赖（包括curl用于健康检查）
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.py ./
COPY README.md ./

# 从vue-builder阶段复制构建好的Vue应用
COPY --from=vue-builder /vue-build/dist ./frontend-vue/dist/

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# 暴露三个端口
EXPOSE 15000 15001 15002

# 健康检查 - 检查所有三个服务
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:15000/api/health && \
        curl -f http://localhost:15001/ && \
        curl -f http://localhost:15002/ || exit 1

# 设置启动命令
CMD ["python", "backend/app.py"]

# 可选的启动脚本
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT ["docker-entrypoint.sh"] 