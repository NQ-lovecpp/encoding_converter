#!/usr/bin/env python3
"""
下载Python包的wheel文件到本地
避免Docker构建时的网络问题
"""

import subprocess
import sys
import os

def run_command(cmd):
    """运行命令并打印输出"""
    print(f"执行: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode == 0

def main():
    print("🔽 开始下载Python依赖包...")
    
    # 创建wheels目录
    os.makedirs("wheels", exist_ok=True)
    
    # 要下载的包列表
    packages = [
        "Flask==3.0.0",
        "Flask-CORS==4.0.0", 
        "chardet==5.2.0",
        "requests==2.31.0"
    ]
    
    print(f"📦 准备下载 {len(packages)} 个包...")
    
    for package in packages:
        print(f"\n⬇️  下载 {package}...")
        cmd = f"pip download --dest wheels --no-deps {package}"
        if not run_command(cmd):
            print(f"❌ 下载 {package} 失败")
            continue
            
        # 同时下载依赖
        cmd = f"pip download --dest wheels {package}"
        if run_command(cmd):
            print(f"✅ {package} 下载成功")
        else:
            print(f"⚠️  {package} 部分下载成功")
    
    print("\n📊 下载完成! wheels目录内容:")
    run_command("ls -la wheels/")
    
    print("\n✅ 所有包已下载到 wheels/ 目录")
    print("💡 现在可以使用离线Dockerfile构建镜像")

if __name__ == "__main__":
    main() 