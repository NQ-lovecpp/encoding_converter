#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import sys
import os
from pathlib import Path

def print_banner():
    """打印欢迎横幅"""
    print("=" * 60)
    print("✨" + " " * 10 + "字符编码转换器 Pro" + " " * 10 + "✨")
    print("🚀" + " " * 8 + "Character Encoding Converter" + " " * 8 + "🚀")
    print("=" * 60)
    print()

def show_menu():
    """显示选择菜单"""
    print("📋 请选择要启动的版本：")
    print()
    print("1. 🌐 网页版 (Web Version)")
    print("   - 现代化的网页界面")
    print("   - 支持文件上传下载")
    print("   - 实时编码转换")
    print("   - 跨平台兼容")
    print()
    print("2. 🖥️  桌面版 (Desktop Version)")
    print("   - 原生桌面应用")
    print("   - 更快的响应速度")
    print("   - 离线使用")
    print("   - 系统集成")
    print()
    print("3. 🔧 环境检查 (Environment Check)")
    print("   - 检查Python环境")
    print("   - 检查依赖包")
    print("   - 系统信息")
    print()
    print("4. ❌ 退出 (Exit)")
    print()

def check_environment():
    """检查运行环境"""
    print("🔍 检查运行环境...")
    print("-" * 40)
    
    # Python版本
    print(f"🐍 Python版本: {sys.version}")
    
    # 检查Tkinter
    try:
        import tkinter
        print("✅ Tkinter: 可用")
    except ImportError:
        print("❌ Tkinter: 不可用")
    
    # 检查其他包
    packages = ['requests', 'chardet', 'pathlib']
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package}: 已安装")
        except ImportError:
            print(f"⚠️ {package}: 未安装")
    
    # 检查文件
    files_to_check = [
        'frontend/index.html',
        'backend/app.py',
        'desktop/encoding_converter_tkinter.py'
    ]
    
    print("\n📁 检查项目文件:")
    for file_path in files_to_check:
        if Path(file_path).exists():
            print(f"✅ {file_path}: 存在")
        else:
            print(f"❌ {file_path}: 缺失")
    
    print("-" * 40)

def start_web():
    """启动网页版"""
    script_path = Path(__file__).parent / "start_web.py"
    if script_path.exists():
        subprocess.run([sys.executable, str(script_path)])
    else:
        print("❌ 找不到网页版启动脚本")

def start_desktop():
    """启动桌面版"""
    script_path = Path(__file__).parent / "start_desktop.py"
    if script_path.exists():
        subprocess.run([sys.executable, str(script_path)])
    else:
        print("❌ 找不到桌面版启动脚本")

def main():
    """主函数"""
    while True:
        print_banner()
        show_menu()
        
        try:
            choice = input("🎯 请输入选项 (1-4): ").strip()
            print()
            
            if choice == '1':
                print("🌐 启动网页版...")
                start_web()
                
            elif choice == '2':
                print("🖥️ 启动桌面版...")
                start_desktop()
                
            elif choice == '3':
                check_environment()
                input("\n按回车键继续...")
                continue
                
            elif choice == '4':
                print("👋 感谢使用字符编码转换器 Pro!")
                break
                
            else:
                print("❌ 无效选项，请重新选择")
                input("按回车键继续...")
                continue
                
        except KeyboardInterrupt:
            print("\n👋 用户取消操作，再见!")
            break
        except Exception as e:
            print(f"❌ 发生错误: {e}")
            input("按回车键继续...")
            continue

if __name__ == "__main__":
    main() 