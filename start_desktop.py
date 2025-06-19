#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import sys
import os
from pathlib import Path

def check_python_packages():
    """检查必要的Python包"""
    print("🔍 检查Python包...")
    
    # 检查Tkinter
    try:
        import tkinter
        print("✅ Tkinter 可用")
        return True
    except ImportError:
        print("❌ Tkinter 不可用")
        return False

def start_desktop_version():
    """启动桌面版编码转换器"""
    print("🚀 正在启动字符编码转换器桌面版...")
    
    # 获取当前目录
    current_dir = Path(__file__).parent
    desktop_file = current_dir / "desktop" / "encoding_converter_tkinter.py"
    
    if not desktop_file.exists():
        print("❌ 找不到桌面版文件")
        return False
    
    try:
        # 启动桌面版
        print(f"📂 运行文件: {desktop_file}")
        
        # 使用当前Python解释器运行
        result = subprocess.run([
            sys.executable, 
            str(desktop_file)
        ], check=False)
        
        if result.returncode == 0:
            print("✅ 桌面版运行完成")
        else:
            print(f"⚠️ 桌面版退出，返回码: {result.returncode}")
            
        return True
        
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        return False

def show_usage():
    """显示使用说明"""
    print("\n📋 桌面版功能说明：")
    print("1. 文本编码转换 - 支持多种字符编码")
    print("2. 文件编码转换 - 批量处理文件")
    print("3. 实时预览 - 即时查看转换结果")
    print("4. 编码检测 - 自动识别文件编码")
    print("5. 历史记录 - 保存转换历史")

if __name__ == "__main__":
    print("=" * 50)
    print("✨ 字符编码转换器 Pro - 桌面版启动器")
    print("=" * 50)
    
    # 检查环境
    if not check_python_packages():
        print("\n❌ 环境检查失败，无法启动桌面版")
        input("按回车键退出...")
        sys.exit(1)
    
    # 显示使用说明
    show_usage()
    
    # 启动桌面版
    success = start_desktop_version()
    
    if not success:
        print("\n❌ 桌面版启动失败")
        input("按回车键退出...")
    else:
        print("\n👋 桌面版已关闭") 