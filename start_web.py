#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import webbrowser
import time
import subprocess
import sys
import os
from pathlib import Path

def start_web_version():
    """启动网页版编码转换器"""
    print("🚀 正在启动字符编码转换器网页版...")
    
    # 获取当前目录
    current_dir = Path(__file__).parent
    frontend_dir = current_dir / "frontend"
    
    try:
        # 方法1: 直接用浏览器打开本地文件
        html_file = frontend_dir / "index.html"
        if html_file.exists():
            print(f"📂 打开HTML文件: {html_file}")
            
            # 构造file:// URL
            file_url = f"file:///{html_file.absolute().as_posix()}"
            print(f"🌐 URL: {file_url}")
            
            # 在默认浏览器中打开
            webbrowser.open(file_url)
            print("✅ 网页版已在浏览器中打开！")
            
            # 显示使用说明
            print("\n📋 使用说明：")
            print("1. 在网页中输入要转换的文本")
            print("2. 选择目标编码格式")
            print("3. 查看实时转换结果")
            print("4. 可以上传文件或下载结果")
            print("\n💡 提示：确保Flask后端服务正在运行(http://localhost:5000)")
            
        else:
            print("❌ 找不到HTML文件")
            
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        
        # 备用方案：打印URL让用户手动打开
        try:
            html_file = frontend_dir / "index.html"
            file_url = f"file:///{html_file.absolute().as_posix()}"
            print(f"\n🔗 请手动在浏览器中打开以下URL:")
            print(file_url)
        except:
            print("\n🔗 请手动在浏览器中打开: frontend/index.html")

def check_backend():
    """检查后端服务是否运行"""
    try:
        import requests
        response = requests.get("http://localhost:5000/api/encodings", timeout=2)
        if response.status_code == 200:
            print("✅ Flask后端服务运行正常")
            return True
    except:
        pass
    
    print("⚠️ Flask后端服务未运行，请先启动：python backend/app.py")
    return False

if __name__ == "__main__":
    print("=" * 50)
    print("✨ 字符编码转换器 Pro - 网页版启动器")
    print("=" * 50)
    
    # 检查后端服务
    check_backend()
    
    # 启动网页版
    start_web_version()
    
    # 保持脚本运行
    try:
        input("\n按回车键退出...")
    except KeyboardInterrupt:
        print("\n👋 再见！") 