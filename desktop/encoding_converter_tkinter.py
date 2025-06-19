#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import chardet
import base64
import unicodedata
import json
from datetime import datetime
import sys
import os

class EncodingConverterTkinter:
    """基于Tkinter的字符编码转换器"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("✨ 字符编码转换器 Pro")
        self.root.geometry("1200x800")
        self.root.minsize(800, 600)
        
        # 设置样式
        self.setup_style()
        
        # 应用状态
        self.current_text = ""
        self.selected_encodings = {'utf-8', 'utf-16', 'gbk', 'ascii', 'latin-1'}
        self.conversion_results = None
        
        # 创建界面
        self.create_widgets()
        
        # 设置图标（如果存在）
        try:
            self.root.iconbitmap(default='encoding.ico')
        except:
            pass
    
    def setup_style(self):
        """设置样式"""
        # 配置ttk样式
        style = ttk.Style()
        style.theme_use('clam')
        
        # 自定义颜色
        style.configure('Title.TLabel', font=('Arial', 16, 'bold'), foreground='#2d3748')
        style.configure('Header.TLabel', font=('Arial', 12, 'bold'), foreground='#4a5568')
        style.configure('Info.TLabel', font=('Arial', 10), foreground='#718096')
        
        # 按钮样式
        style.configure('Primary.TButton', font=('Arial', 10, 'bold'))
        style.configure('Secondary.TButton', font=('Arial', 9))
        
        # 设置背景色
        self.root.configure(bg='#f8fafc')
    
    def create_widgets(self):
        """创建界面组件"""
        # 主框架
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 配置权重
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
        # 左侧边栏
        self.create_sidebar(main_frame)
        
        # 右侧工作区
        self.create_workspace(main_frame)
        
        # 创建菜单
        self.create_menu()
        
        # 状态栏
        self.create_statusbar()
    
    def create_sidebar(self, parent):
        """创建侧边栏"""
        sidebar_frame = ttk.LabelFrame(parent, text="⚙️ 设置", padding="15")
        sidebar_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        sidebar_frame.configure(width=300)
        
        # 编码选择
        encoding_frame = ttk.LabelFrame(sidebar_frame, text="📝 编码格式", padding="10")
        encoding_frame.pack(fill=tk.X, pady=(0, 10))
        
        # 支持的编码
        encodings = [
            'utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'utf-32',
            'ascii', 'latin-1', 'cp1252', 'gbk', 'gb2312', 
            'big5', 'shift_jis', 'euc-jp', 'iso-8859-1'
        ]
        
        self.encoding_vars = {}
        for i, encoding in enumerate(encodings):
            var = tk.BooleanVar(value=encoding in self.selected_encodings)
            self.encoding_vars[encoding] = var
            
            cb = ttk.Checkbutton(
                encoding_frame, 
                text=encoding.upper(), 
                variable=var,
                command=lambda enc=encoding: self.toggle_encoding(enc)
            )
            cb.grid(row=i//2, column=i%2, sticky=tk.W, padx=5, pady=2)
        
        # 统计信息
        stats_frame = ttk.LabelFrame(sidebar_frame, text="📊 统计信息", padding="10")
        stats_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.stats_labels = {}
        stats_info = [('字符数:', 'char_count'), ('字节数:', 'byte_count'), ('唯一字符:', 'unique_chars')]
        
        for i, (label_text, key) in enumerate(stats_info):
            ttk.Label(stats_frame, text=label_text, style='Info.TLabel').grid(row=i, column=0, sticky=tk.W, pady=2)
            label = ttk.Label(stats_frame, text="0", style='Header.TLabel')
            label.grid(row=i, column=1, sticky=tk.E, pady=2)
            self.stats_labels[key] = label
        
        stats_frame.columnconfigure(1, weight=1)
        
        # 文件操作
        file_frame = ttk.LabelFrame(sidebar_frame, text="📁 文件操作", padding="10")
        file_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Button(file_frame, text="📂 打开文件", command=self.open_file, style='Secondary.TButton').pack(fill=tk.X, pady=2)
        ttk.Button(file_frame, text="🔍 检测编码", command=self.detect_encoding, style='Secondary.TButton').pack(fill=tk.X, pady=2)
        ttk.Button(file_frame, text="💾 保存结果", command=self.save_results, style='Primary.TButton').pack(fill=tk.X, pady=2)
    
    def create_workspace(self, parent):
        """创建主工作区"""
        workspace_frame = ttk.Frame(parent)
        workspace_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        workspace_frame.columnconfigure(0, weight=1)
        workspace_frame.rowconfigure(1, weight=1)
        
        # 输入区域
        input_frame = ttk.LabelFrame(workspace_frame, text="📝 文本输入", padding="15")
        input_frame.pack(fill=tk.BOTH, pady=(0, 10))
        input_frame.columnconfigure(0, weight=1)
        
        # 工具栏
        toolbar = ttk.Frame(input_frame)
        toolbar.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        toolbar.columnconfigure(2, weight=1)
        
        ttk.Button(toolbar, text="🗑️ 清空", command=self.clear_text, style='Secondary.TButton').grid(row=0, column=0, padx=(0, 5))
        ttk.Button(toolbar, text="📋 粘贴", command=self.paste_text, style='Secondary.TButton').grid(row=0, column=1, padx=(0, 5))
        
        self.char_counter_label = ttk.Label(toolbar, text="0 字符", style='Info.TLabel')
        self.char_counter_label.grid(row=0, column=3, sticky=tk.E)
        
        # 文本输入框
        self.text_input = scrolledtext.ScrolledText(
            input_frame, 
            height=8, 
            wrap=tk.WORD,
            font=('Consolas', 11)
        )
        self.text_input.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.text_input.bind('<KeyRelease>', self.on_text_change)
        self.text_input.bind('<Button-1>', self.on_text_change)
        
        # 结果区域
        results_frame = ttk.LabelFrame(workspace_frame, text="✨ 转换结果", padding="15")
        results_frame.pack(fill=tk.BOTH, expand=True)
        results_frame.columnconfigure(0, weight=1)
        results_frame.rowconfigure(1, weight=1)
        
        # 视图选择
        view_frame = ttk.Frame(results_frame)
        view_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.view_var = tk.StringVar(value="table")
        ttk.Radiobutton(view_frame, text="📋 表格视图", variable=self.view_var, value="table", command=self.switch_view).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Radiobutton(view_frame, text="💻 原始数据", variable=self.view_var, value="raw", command=self.switch_view).pack(side=tk.LEFT, padx=(0, 10))
        
        # 结果显示区域
        self.result_notebook = ttk.Notebook(results_frame)
        self.result_notebook.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 表格视图
        self.create_table_view()
        
        # 原始数据视图
        self.create_raw_view()
        
        # 默认显示表格视图
        self.result_notebook.select(0)
    
    def create_table_view(self):
        """创建表格视图"""
        table_frame = ttk.Frame(self.result_notebook)
        self.result_notebook.add(table_frame, text="📋 表格视图")
        
        # 创建Treeview表格
        columns = ['字符', 'Unicode', '名称', 'UTF-8', 'UTF-16', 'GBK', 'ASCII']
        self.tree = ttk.Treeview(table_frame, columns=columns, show='headings', height=15)
        
        # 设置列标题和宽度
        for col in columns:
            self.tree.heading(col, text=col)
            if col == '字符':
                self.tree.column(col, width=50, anchor=tk.CENTER)
            elif col == 'Unicode':
                self.tree.column(col, width=80, anchor=tk.CENTER)
            elif col == '名称':
                self.tree.column(col, width=200, anchor=tk.W)
            else:
                self.tree.column(col, width=120, anchor=tk.CENTER)
        
        # 滚动条
        table_scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=table_scrollbar.set)
        
        # 布局
        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        table_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        table_frame.columnconfigure(0, weight=1)
        table_frame.rowconfigure(0, weight=1)
    
    def create_raw_view(self):
        """创建原始数据视图"""
        raw_frame = ttk.Frame(self.result_notebook)
        self.result_notebook.add(raw_frame, text="💻 原始数据")
        
        self.raw_text = scrolledtext.ScrolledText(
            raw_frame, 
            wrap=tk.WORD,
            font=('Consolas', 10),
            state=tk.DISABLED
        )
        self.raw_text.pack(fill=tk.BOTH, expand=True)
    
    def create_menu(self):
        """创建菜单栏"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # 文件菜单
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="文件", menu=file_menu)
        file_menu.add_command(label="打开文件...", command=self.open_file, accelerator="Ctrl+O")
        file_menu.add_command(label="保存结果...", command=self.save_results, accelerator="Ctrl+S")
        file_menu.add_separator()
        file_menu.add_command(label="退出", command=self.root.quit, accelerator="Ctrl+Q")
        
        # 编辑菜单
        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="编辑", menu=edit_menu)
        edit_menu.add_command(label="复制结果", command=self.copy_results, accelerator="Ctrl+C")
        edit_menu.add_command(label="粘贴文本", command=self.paste_text, accelerator="Ctrl+V")
        edit_menu.add_command(label="清空", command=self.clear_text)
        
        # 帮助菜单
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="帮助", menu=help_menu)
        help_menu.add_command(label="关于", command=self.show_about)
        
        # 快捷键绑定
        self.root.bind('<Control-o>', lambda e: self.open_file())
        self.root.bind('<Control-s>', lambda e: self.save_results())
        self.root.bind('<Control-c>', lambda e: self.copy_results())
        self.root.bind('<Control-v>', lambda e: self.paste_text())
        self.root.bind('<Control-q>', lambda e: self.root.quit())
    
    def create_statusbar(self):
        """创建状态栏"""
        self.status_var = tk.StringVar(value="就绪")
        statusbar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        statusbar.grid(row=1, column=0, sticky=(tk.W, tk.E))
    
    def toggle_encoding(self, encoding):
        """切换编码选择"""
        if self.encoding_vars[encoding].get():
            self.selected_encodings.add(encoding)
        else:
            self.selected_encodings.discard(encoding)
        
        if self.current_text.strip():
            self.convert_text()
    
    def on_text_change(self, event=None):
        """文本变化处理"""
        self.current_text = self.text_input.get('1.0', tk.END).strip()
        char_count = len(self.current_text)
        self.char_counter_label.config(text=f"{char_count} 字符")
        
        if self.current_text:
            # 延迟转换以提高性能
            self.root.after(500, self.convert_text)
        else:
            self.clear_results()
    
    def convert_text(self):
        """转换文本编码"""
        if not self.current_text or not self.selected_encodings:
            return
        
        self.status_var.set("正在转换...")
        self.root.update()
        
        try:
            results = self.perform_conversion(self.current_text)
            self.conversion_results = results
            self.update_ui()
            self.status_var.set("转换完成")
        except Exception as e:
            self.status_var.set(f"转换失败: {str(e)}")
            messagebox.showerror("错误", f"转换失败: {str(e)}")
    
    def perform_conversion(self, text):
        """执行编码转换"""
        results = {
            'characters': [],
            'overall': {},
            'stats': {
                'length': len(text),
                'unique_chars': len(set(text))
            }
        }
        
        # 字符级转换
        for i, char in enumerate(text):
            char_info = {
                'char': char,
                'unicode': f'U+{ord(char):04X}',
                'unicode_name': '',
                'position': i,
                'encodings': {}
            }
            
            # 获取Unicode名称
            try:
                char_info['unicode_name'] = unicodedata.name(char, 'UNKNOWN')
            except:
                char_info['unicode_name'] = 'UNKNOWN'
            
            # 各种编码转换
            for encoding in self.selected_encodings:
                try:
                    encoded = char.encode(encoding)
                    char_info['encodings'][encoding] = {
                        'success': True,
                        'hex': encoded.hex().upper(),
                        'bytes': list(encoded),
                        'base64': base64.b64encode(encoded).decode('ascii'),
                        'length': len(encoded)
                    }
                except UnicodeEncodeError:
                    char_info['encodings'][encoding] = {
                        'success': False,
                        'error': 'Cannot encode'
                    }
            
            results['characters'].append(char_info)
        
        # 整体编码
        for encoding in self.selected_encodings:
            try:
                encoded = text.encode(encoding)
                results['overall'][encoding] = {
                    'success': True,
                    'hex': encoded.hex().upper(),
                    'bytes': list(encoded),
                    'base64': base64.b64encode(encoded).decode('ascii'),
                    'length': len(encoded)
                }
            except UnicodeEncodeError:
                results['overall'][encoding] = {
                    'success': False,
                    'error': 'Cannot encode'
                }
        
        return results
    
    def update_ui(self):
        """更新界面显示"""
        if not self.conversion_results:
            return
        
        # 更新统计信息
        stats = self.conversion_results['stats']
        self.stats_labels['char_count'].config(text=str(stats['length']))
        self.stats_labels['unique_chars'].config(text=str(stats['unique_chars']))
        
        # 计算UTF-8字节数
        utf8_result = self.conversion_results['overall'].get('utf-8')
        if utf8_result and utf8_result.get('success'):
            self.stats_labels['byte_count'].config(text=str(utf8_result['length']))
        
        # 更新表格和原始数据
        self.update_table_view()
        self.update_raw_view()
    
    def update_table_view(self):
        """更新表格视图"""
        # 清空现有数据
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        if not self.conversion_results:
            return
        
        # 添加数据
        for char_data in self.conversion_results['characters']:
            char = char_data['char']
            unicode_code = char_data['unicode']
            name = char_data['unicode_name'][:30] + '...' if len(char_data['unicode_name']) > 30 else char_data['unicode_name']
            
            # 获取各种编码的十六进制表示
            utf8_hex = char_data['encodings'].get('utf-8', {}).get('hex', 'N/A')
            utf16_hex = char_data['encodings'].get('utf-16', {}).get('hex', 'N/A')
            gbk_hex = char_data['encodings'].get('gbk', {}).get('hex', 'N/A')
            ascii_hex = char_data['encodings'].get('ascii', {}).get('hex', 'N/A')
            
            self.tree.insert('', tk.END, values=(char, unicode_code, name, utf8_hex, utf16_hex, gbk_hex, ascii_hex))
    
    def update_raw_view(self):
        """更新原始数据视图"""
        if not self.conversion_results:
            return
        
        content = f"文本: \"{self.current_text}\"\n"
        content += f"字符数: {self.conversion_results['stats']['length']}\n"
        content += f"唯一字符: {self.conversion_results['stats']['unique_chars']}\n\n"
        
        content += "=== 整体编码结果 ===\n"
        for encoding, result in self.conversion_results['overall'].items():
            if result.get('success'):
                content += f"{encoding.upper()}: {result['hex']}\n"
            else:
                content += f"{encoding.upper()}: 编码失败\n"
        
        content += "\n=== 字符详情 ===\n"
        for char_data in self.conversion_results['characters']:
            content += f"\n字符: {char_data['char']}\n"
            content += f"Unicode: {char_data['unicode']}\n"
            content += f"名称: {char_data['unicode_name']}\n"
            
            for encoding, result in char_data['encodings'].items():
                if result.get('success'):
                    content += f"  {encoding.upper()}: {result['hex']}\n"
        
        # 更新文本
        self.raw_text.config(state=tk.NORMAL)
        self.raw_text.delete('1.0', tk.END)
        self.raw_text.insert('1.0', content)
        self.raw_text.config(state=tk.DISABLED)
    
    def switch_view(self):
        """切换视图"""
        if self.view_var.get() == "table":
            self.result_notebook.select(0)
        else:
            self.result_notebook.select(1)
    
    def clear_text(self):
        """清空文本"""
        self.text_input.delete('1.0', tk.END)
        self.clear_results()
        self.char_counter_label.config(text="0 字符")
    
    def clear_results(self):
        """清空结果"""
        self.conversion_results = None
        
        # 清空表格
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # 清空原始数据
        self.raw_text.config(state=tk.NORMAL)
        self.raw_text.delete('1.0', tk.END)
        self.raw_text.config(state=tk.DISABLED)
        
        # 重置统计
        for label in self.stats_labels.values():
            label.config(text="0")
    
    def paste_text(self):
        """粘贴文本"""
        try:
            text = self.root.clipboard_get()
            self.text_input.delete('1.0', tk.END)
            self.text_input.insert('1.0', text)
            self.on_text_change()
        except tk.TclError:
            messagebox.showwarning("警告", "剪贴板为空或无法访问")
    
    def copy_results(self):
        """复制结果"""
        if not self.conversion_results:
            messagebox.showinfo("提示", "没有可复制的结果")
            return
        
        content = self.raw_text.get('1.0', tk.END)
        self.root.clipboard_clear()
        self.root.clipboard_append(content)
        self.status_var.set("结果已复制到剪贴板")
    
    def open_file(self):
        """打开文件"""
        file_path = filedialog.askopenfilename(
            title="选择文本文件",
            filetypes=[
                ("文本文件", "*.txt"),
                ("所有文件", "*.*")
            ]
        )
        
        if file_path:
            try:
                with open(file_path, 'rb') as f:
                    raw_data = f.read()
                
                # 检测编码
                detected = chardet.detect(raw_data)
                encoding = detected['encoding'] or 'utf-8'
                confidence = detected.get('confidence', 0) * 100
                
                # 解码文本
                text = raw_data.decode(encoding, errors='ignore')
                
                # 显示在输入框
                self.text_input.delete('1.0', tk.END)
                self.text_input.insert('1.0', text)
                self.on_text_change()
                
                self.status_var.set(f"文件已加载 (编码: {encoding}, 置信度: {confidence:.0f}%)")
                
            except Exception as e:
                messagebox.showerror("错误", f"无法打开文件: {str(e)}")
    
    def detect_encoding(self):
        """检测编码"""
        if not self.current_text:
            messagebox.showinfo("提示", "请先输入文本")
            return
        
        try:
            # 将文本编码为字节再检测
            text_bytes = self.current_text.encode('utf-8')
            detected = chardet.detect(text_bytes)
            
            encoding = detected['encoding']
            confidence = detected.get('confidence', 0) * 100
            
            messagebox.showinfo(
                "编码检测结果",
                f"检测到的编码: {encoding}\n置信度: {confidence:.1f}%"
            )
        except Exception as e:
            messagebox.showerror("错误", f"编码检测失败: {str(e)}")
    
    def save_results(self):
        """保存结果"""
        if not self.conversion_results:
            messagebox.showinfo("提示", "没有可保存的结果")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="保存结果",
            defaultextension=".txt",
            filetypes=[
                ("文本文件", "*.txt"),
                ("JSON文件", "*.json"),
                ("所有文件", "*.*")
            ]
        )
        
        if file_path:
            try:
                if file_path.endswith('.json'):
                    # 保存为JSON
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(self.conversion_results, f, ensure_ascii=False, indent=2)
                else:
                    # 保存为文本
                    content = self.raw_text.get('1.0', tk.END)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                
                self.status_var.set(f"结果已保存到: {file_path}")
                
            except Exception as e:
                messagebox.showerror("错误", f"保存失败: {str(e)}")
    
    def show_about(self):
        """显示关于对话框"""
        messagebox.showinfo(
            "关于",
            "✨ 字符编码转换器 Pro\n\n"
            "版本: 2.0 (Tkinter Edition)\n"
            "一个现代化的字符编码转换工具\n\n"
            "功能特点:\n"
            "• 🎯 实时字符编码转换\n"
            "• 📊 详细的统计信息\n"
            "• 📁 文件导入/导出支持\n"
            "• 🔍 智能编码检测\n"
            "• 💾 多格式保存\n\n"
            "支持编码: UTF-8, UTF-16, GBK, ASCII等"
        )
    
    def run(self):
        """运行应用程序"""
        self.root.mainloop()

def main():
    """主函数"""
    try:
        app = EncodingConverterTkinter()
        app.run()
    except Exception as e:
        print(f"应用启动失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 