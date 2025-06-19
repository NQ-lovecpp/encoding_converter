import sys
import os
import json
import chardet
import base64
import unicodedata
from datetime import datetime
from pathlib import Path

from PyQt6.QtWidgets import *
from PyQt6.QtCore import *
from PyQt6.QtGui import *

class ModernButton(QPushButton):
    """现代化按钮组件"""
    def __init__(self, text="", icon=None, primary=False):
        super().__init__(text)
        self.primary = primary
        self.setup_style()
        if icon:
            self.setIcon(icon)
            self.setIconSize(QSize(16, 16))
    
    def setup_style(self):
        if self.primary:
            style = """
                ModernButton {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 #667eea, stop:1 #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 20px;
                    font-weight: 600;
                    font-size: 14px;
                }
                ModernButton:hover {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 #5a67d8, stop:1 #6b46c1);
                }
                ModernButton:pressed {
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 #4c51bf, stop:1 #553c9a);
                }
            """
        else:
            style = """
                ModernButton {
                    background: #f8fafc;
                    color: #2d3748;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: 14px;
                }
                ModernButton:hover {
                    background: #edf2f7;
                    border-color: #667eea;
                }
                ModernButton:pressed {
                    background: #e2e8f0;
                }
            """
        self.setStyleSheet(style)

class ModernCard(QFrame):
    """现代化卡片组件"""
    def __init__(self):
        super().__init__()
        self.setFrameStyle(QFrame.Shape.StyledPanel)
        self.setStyleSheet("""
            ModernCard {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
            }
            ModernCard:hover {
                border-color: #667eea;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            }
        """)

class CharacterCard(ModernCard):
    """字符卡片组件"""
    def __init__(self, char_data):
        super().__init__()
        self.char_data = char_data
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        
        # 字符显示
        char_label = QLabel(self.char_data['char'])
        char_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        char_label.setStyleSheet("""
            QLabel {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                margin: 8px;
            }
        """)
        layout.addWidget(char_label)
        
        # Unicode 信息
        unicode_label = QLabel(f"Unicode: {self.char_data['unicode']}")
        unicode_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        unicode_label.setStyleSheet("color: #718096; font-size: 12px;")
        layout.addWidget(unicode_label)
        
        # Unicode 名称
        if self.char_data.get('unicode_name'):
            name_label = QLabel(self.char_data['unicode_name'])
            name_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            name_label.setWordWrap(True)
            name_label.setStyleSheet("color: #a0aec0; font-size: 10px;")
            layout.addWidget(name_label)
        
        # 编码结果
        encodings_widget = QWidget()
        encodings_layout = QVBoxLayout(encodings_widget)
        encodings_layout.setContentsMargins(0, 8, 0, 0)
        
        for encoding, result in self.char_data.get('encodings', {}).items():
            if result.get('success'):
                encoding_frame = QFrame()
                encoding_frame.setStyleSheet("""
                    QFrame {
                        background: #f7fafc;
                        border-radius: 4px;
                        padding: 4px;
                        margin: 1px;
                    }
                """)
                encoding_layout_h = QHBoxLayout(encoding_frame)
                encoding_layout_h.setContentsMargins(8, 4, 8, 4)
                
                name_label = QLabel(encoding.upper())
                name_label.setStyleSheet("color: #4a5568; font-weight: 500; font-size: 10px;")
                
                value_label = QLabel(result['hex'])
                value_label.setStyleSheet("color: #2d3748; font-family: 'Courier New'; font-size: 10px;")
                
                encoding_layout_h.addWidget(name_label)
                encoding_layout_h.addStretch()
                encoding_layout_h.addWidget(value_label)
                
                encodings_layout.addWidget(encoding_frame)
        
        layout.addWidget(encodings_widget)
        
        # 点击复制功能
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.mousePressEvent = self.copy_data
    
    def copy_data(self, event):
        copy_text = f"字符: {self.char_data['char']}\n"
        copy_text += f"Unicode: {self.char_data['unicode']}\n"
        if self.char_data.get('unicode_name'):
            copy_text += f"名称: {self.char_data['unicode_name']}\n"
        
        for encoding, result in self.char_data.get('encodings', {}).items():
            if result.get('success'):
                copy_text += f"{encoding.upper()}: {result['hex']}\n"
        
        QApplication.clipboard().setText(copy_text)
        QToolTip.showText(self.mapToGlobal(event.pos()), "已复制到剪贴板!", self)

class EncodingConverter(QMainWindow):
    """主应用窗口"""
    
    def __init__(self):
        super().__init__()
        self.current_text = ""
        self.selected_encodings = {'utf-8', 'utf-16', 'gbk', 'ascii'}
        self.conversion_results = None
        self.setup_ui()
        self.setup_style()
        
    def setup_ui(self):
        self.setWindowTitle("✨ 字符编码转换器 Pro")
        self.setMinimumSize(1200, 800)
        self.resize(1400, 900)
        
        # 设置窗口图标
        self.setWindowIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_ComputerIcon))
        
        # 创建中央窗口部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 主布局
        main_layout = QHBoxLayout(central_widget)
        main_layout.setSpacing(20)
        main_layout.setContentsMargins(20, 20, 20, 20)
        
        # 左侧边栏
        self.setup_sidebar(main_layout)
        
        # 右侧主工作区
        self.setup_workspace(main_layout)
        
        # 设置菜单栏
        self.setup_menubar()
        
        # 设置状态栏
        self.setup_statusbar()
        
    def setup_sidebar(self, parent_layout):
        """设置侧边栏"""
        sidebar = QWidget()
        sidebar.setFixedWidth(320)
        sidebar.setStyleSheet("""
            QWidget {
                background: #fafbfc;
                border-radius: 16px;
                padding: 16px;
            }
        """)
        
        sidebar_layout = QVBoxLayout(sidebar)
        
        # 编码选择部分
        encoding_section = self.create_section("🔧 编码设置", self.create_encoding_selector())
        sidebar_layout.addWidget(encoding_section)
        
        # 统计信息部分
        stats_section = self.create_section("📊 统计信息", self.create_stats_widget())
        sidebar_layout.addWidget(stats_section)
        
        # 文件操作部分
        file_section = self.create_section("📁 文件操作", self.create_file_widget())
        sidebar_layout.addWidget(file_section)
        
        sidebar_layout.addStretch()
        parent_layout.addWidget(sidebar)
        
    def create_section(self, title, content):
        """创建一个区块"""
        section = QFrame()
        section.setFrameStyle(QFrame.Shape.StyledPanel)
        section.setStyleSheet("""
            QFrame {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                margin: 8px 0;
            }
        """)
        
        layout = QVBoxLayout(section)
        
        # 标题
        title_label = QLabel(title)
        title_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 12px;
            }
        """)
        layout.addWidget(title_label)
        layout.addWidget(content)
        
        return section
        
    def create_encoding_selector(self):
        """创建编码选择器"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # 可用编码列表
        encodings = ['utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'utf-32', 
                    'ascii', 'latin-1', 'gbk', 'gb2312', 'big5', 'shift_jis']
        
        self.encoding_checkboxes = {}
        grid_layout = QGridLayout()
        
        for i, encoding in enumerate(encodings):
            checkbox = QCheckBox(encoding.upper())
            checkbox.setChecked(encoding in self.selected_encodings)
            checkbox.stateChanged.connect(lambda state, enc=encoding: self.toggle_encoding(enc, state))
            checkbox.setStyleSheet("""
                QCheckBox {
                    font-size: 12px;
                    padding: 4px;
                }
                QCheckBox::indicator {
                    width: 16px;
                    height: 16px;
                }
                QCheckBox::indicator:checked {
                    background: #667eea;
                    border: 1px solid #667eea;
                }
            """)
            
            self.encoding_checkboxes[encoding] = checkbox
            grid_layout.addWidget(checkbox, i // 2, i % 2)
        
        layout.addLayout(grid_layout)
        return widget
        
    def create_stats_widget(self):
        """创建统计信息组件"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        self.stats_labels = {}
        stats = [('字符数', 'char_count'), ('字节数', 'byte_count'), ('唯一字符', 'unique_chars')]
        
        for label_text, key in stats:
            stat_frame = QFrame()
            stat_frame.setStyleSheet("""
                QFrame {
                    background: #f7fafc;
                    border-radius: 8px;
                    padding: 8px;
                    margin: 2px 0;
                }
            """)
            stat_layout = QHBoxLayout(stat_frame)
            
            label = QLabel(label_text)
            label.setStyleSheet("color: #718096; font-size: 12px;")
            
            value = QLabel("0")
            value.setStyleSheet("color: #667eea; font-weight: 600; font-size: 14px;")
            value.setAlignment(Qt.AlignmentFlag.AlignRight)
            
            stat_layout.addWidget(label)
            stat_layout.addStretch()
            stat_layout.addWidget(value)
            
            self.stats_labels[key] = value
            layout.addWidget(stat_frame)
        
        return widget
        
    def create_file_widget(self):
        """创建文件操作组件"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # 文件拖拽区域
        self.file_drop_area = QLabel("🗎\n拖拽文件到此处\n或点击选择文件")
        self.file_drop_area.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.file_drop_area.setStyleSheet("""
            QLabel {
                border: 2px dashed #cbd5e0;
                border-radius: 8px;
                padding: 24px;
                text-align: center;
                color: #a0aec0;
                font-size: 14px;
                background: #f7fafc;
            }
            QLabel:hover {
                border-color: #667eea;
                background: #edf2f7;
                color: #667eea;
            }
        """)
        self.file_drop_area.mousePressEvent = self.select_file
        layout.addWidget(self.file_drop_area)
        
        # 文件操作按钮
        buttons_layout = QHBoxLayout()
        
        detect_btn = ModernButton("🔍 检测编码")
        detect_btn.clicked.connect(self.detect_encoding)
        
        export_btn = ModernButton("💾 导出结果", primary=True)
        export_btn.clicked.connect(self.export_results)
        
        buttons_layout.addWidget(detect_btn)
        buttons_layout.addWidget(export_btn)
        layout.addLayout(buttons_layout)
        
        return widget
        
    def setup_workspace(self, parent_layout):
        """设置主工作区"""
        workspace = QWidget()
        workspace_layout = QVBoxLayout(workspace)
        
        # 输入区域
        input_section = self.create_input_section()
        workspace_layout.addWidget(input_section)
        
        # 结果展示区域
        results_section = self.create_results_section()
        workspace_layout.addWidget(results_section)
        
        parent_layout.addWidget(workspace)
        
    def create_input_section(self):
        """创建输入区域"""
        section = ModernCard()
        layout = QVBoxLayout(section)
        
        # 标题栏
        header = QHBoxLayout()
        title = QLabel("📝 文本输入")
        title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
            }
        """)
        header.addWidget(title)
        header.addStretch()
        
        # 操作按钮
        clear_btn = ModernButton("🗑️ 清空")
        clear_btn.clicked.connect(self.clear_text)
        
        paste_btn = ModernButton("📋 粘贴")
        paste_btn.clicked.connect(self.paste_text)
        
        header.addWidget(clear_btn)
        header.addWidget(paste_btn)
        
        layout.addLayout(header)
        
        # 文本输入框
        self.text_input = QTextEdit()
        self.text_input.setPlaceholderText("请输入要转换的文本，或拖拽文件到此处...")
        self.text_input.setMaximumHeight(150)
        self.text_input.textChanged.connect(self.on_text_changed)
        self.text_input.setStyleSheet("""
            QTextEdit {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
                font-size: 14px;
                background: #ffffff;
            }
            QTextEdit:focus {
                border-color: #667eea;
                outline: none;
            }
        """)
        layout.addWidget(self.text_input)
        
        # 输入信息栏
        info_layout = QHBoxLayout()
        self.char_counter = QLabel("0 字符")
        self.char_counter.setStyleSheet("color: #a0aec0; font-size: 12px;")
        
        self.encoding_info = QLabel("📋 UTF-8")
        self.encoding_info.setStyleSheet("color: #718096; font-size: 12px;")
        
        info_layout.addWidget(self.char_counter)
        info_layout.addStretch()
        info_layout.addWidget(self.encoding_info)
        
        layout.addLayout(info_layout)
        
        return section
        
    def create_results_section(self):
        """创建结果展示区域"""
        section = ModernCard()
        layout = QVBoxLayout(section)
        
        # 标题栏
        header = QHBoxLayout()
        title = QLabel("✨ 转换结果")
        title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
            }
        """)
        header.addWidget(title)
        header.addStretch()
        
        # 视图切换按钮
        view_buttons = QHBoxLayout()
        self.view_btn_group = QButtonGroup()
        
        char_view_btn = ModernButton("🎯 字符视图", primary=True)
        table_view_btn = ModernButton("📋 表格视图")
        raw_view_btn = ModernButton("💻 原始数据")
        
        char_view_btn.setCheckable(True)
        table_view_btn.setCheckable(True)
        raw_view_btn.setCheckable(True)
        char_view_btn.setChecked(True)
        
        self.view_btn_group.addButton(char_view_btn, 0)
        self.view_btn_group.addButton(table_view_btn, 1)
        self.view_btn_group.addButton(raw_view_btn, 2)
        self.view_btn_group.idClicked.connect(self.switch_view)
        
        view_buttons.addWidget(char_view_btn)
        view_buttons.addWidget(table_view_btn)
        view_buttons.addWidget(raw_view_btn)
        view_buttons.addStretch()
        
        header.addLayout(view_buttons)
        layout.addLayout(header)
        
        # 结果显示区域
        self.results_stack = QStackedWidget()
        
        # 字符视图
        self.char_scroll = QScrollArea()
        self.char_scroll.setWidgetResizable(True)
        self.char_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.char_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        
        self.char_container = QWidget()
        self.char_layout = FlowLayout(self.char_container)
        self.char_scroll.setWidget(self.char_container)
        
        # 表格视图
        self.table_view = QTableWidget()
        self.table_view.setStyleSheet("""
            QTableWidget {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: white;
                gridline-color: #f1f5f9;
            }
            QTableWidget::item {
                padding: 8px;
                border-bottom: 1px solid #f1f5f9;
            }
            QHeaderView::section {
                background: #f8fafc;
                padding: 8px;
                border: none;
                font-weight: 600;
                color: #2d3748;
            }
        """)
        
        # 原始数据视图
        self.raw_view = QTextEdit()
        self.raw_view.setReadOnly(True)
        self.raw_view.setStyleSheet("""
            QTextEdit {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                background: #f8fafc;
            }
        """)
        
        self.results_stack.addWidget(self.char_scroll)
        self.results_stack.addWidget(self.table_view)
        self.results_stack.addWidget(self.raw_view)
        
        layout.addWidget(self.results_stack)
        
        return section
        
    def setup_menubar(self):
        """设置菜单栏"""
        menubar = self.menuBar()
        
        # 文件菜单
        file_menu = menubar.addMenu("文件(&F)")
        
        open_action = QAction("打开文件(&O)", self)
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.select_file)
        file_menu.addAction(open_action)
        
        save_action = QAction("保存结果(&S)", self)
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.export_results)
        file_menu.addAction(save_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("退出(&X)", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # 编辑菜单
        edit_menu = menubar.addMenu("编辑(&E)")
        
        copy_action = QAction("复制结果(&C)", self)
        copy_action.setShortcut("Ctrl+C")
        copy_action.triggered.connect(self.copy_results)
        edit_menu.addAction(copy_action)
        
        paste_action = QAction("粘贴文本(&V)", self)
        paste_action.setShortcut("Ctrl+V")
        paste_action.triggered.connect(self.paste_text)
        edit_menu.addAction(paste_action)
        
        # 帮助菜单
        help_menu = menubar.addMenu("帮助(&H)")
        
        about_action = QAction("关于(&A)", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
        
    def setup_statusbar(self):
        """设置状态栏"""
        self.statusBar().showMessage("就绪")
        
    def setup_style(self):
        """设置应用样式"""
        self.setStyleSheet("""
            QMainWindow {
                background: #f8fafc;
            }
            QScrollBar:vertical {
                background: #f1f5f9;
                width: 12px;
                border-radius: 6px;
            }
            QScrollBar::handle:vertical {
                background: #cbd5e0;
                border-radius: 6px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background: #a0aec0;
            }
        """)
        
    # 事件处理方法
    def toggle_encoding(self, encoding, state):
        """切换编码选择"""
        if state == Qt.CheckState.Checked.value:
            self.selected_encodings.add(encoding)
        else:
            self.selected_encodings.discard(encoding)
        
        if self.current_text:
            self.convert_text()
            
    def on_text_changed(self):
        """文本变化处理"""
        self.current_text = self.text_input.toPlainText()
        self.char_counter.setText(f"{len(self.current_text)} 字符")
        
        if self.current_text.strip():
            QTimer.singleShot(500, self.convert_text)  # 防抖
        else:
            self.clear_results()
            
    def convert_text(self):
        """转换文本"""
        if not self.current_text.strip() or not self.selected_encodings:
            return
            
        self.statusBar().showMessage("正在转换...")
        
        try:
            # 模拟编码转换逻辑
            results = self.perform_conversion(self.current_text)
            self.conversion_results = results
            self.update_ui()
            self.statusBar().showMessage("转换完成")
            
        except Exception as e:
            self.statusBar().showMessage(f"转换失败: {str(e)}")
            
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
        
        # 为每个字符生成编码信息
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
                pass
                
            # 为每种编码生成信息
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
                except:
                    char_info['encodings'][encoding] = {
                        'success': False,
                        'error': 'Encoding failed'
                    }
                    
            results['characters'].append(char_info)
            
        # 整体文本编码
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
            except:
                results['overall'][encoding] = {
                    'success': False,
                    'error': 'Encoding failed'
                }
                
        return results
        
    def update_ui(self):
        """更新UI显示"""
        if not self.conversion_results:
            return
            
        # 更新统计信息
        stats = self.conversion_results['stats']
        self.stats_labels['char_count'].setText(str(stats['length']))
        self.stats_labels['unique_chars'].setText(str(stats['unique_chars']))
        
        # 计算字节数（使用UTF-8）
        utf8_result = self.conversion_results['overall'].get('utf-8')
        if utf8_result and utf8_result.get('success'):
            self.stats_labels['byte_count'].setText(str(utf8_result['length']))
            
        # 更新不同视图
        self.update_character_view()
        self.update_table_view()
        self.update_raw_view()
        
    def update_character_view(self):
        """更新字符视图"""
        # 清空现有内容
        while self.char_layout.count():
            child = self.char_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
                
        # 添加新的字符卡片
        for char_data in self.conversion_results['characters']:
            card = CharacterCard(char_data)
            card.setFixedSize(180, 200)
            self.char_layout.addWidget(card)
            
    def update_table_view(self):
        """更新表格视图"""
        if not self.conversion_results:
            return
            
        characters = self.conversion_results['characters']
        if not characters:
            return
            
        # 设置表格结构
        encodings = list(self.selected_encodings)
        self.table_view.setRowCount(len(characters))
        self.table_view.setColumnCount(3 + len(encodings))
        
        headers = ['字符', 'Unicode', '名称'] + [enc.upper() for enc in encodings]
        self.table_view.setHorizontalHeaderLabels(headers)
        
        # 填充数据
        for row, char_data in enumerate(characters):
            # 字符
            char_item = QTableWidgetItem(char_data['char'])
            char_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            char_item.setFont(QFont('Arial', 16, QFont.Weight.Bold))
            self.table_view.setItem(row, 0, char_item)
            
            # Unicode
            unicode_item = QTableWidgetItem(char_data['unicode'])
            self.table_view.setItem(row, 1, unicode_item)
            
            # 名称
            name_item = QTableWidgetItem(char_data.get('unicode_name', ''))
            self.table_view.setItem(row, 2, name_item)
            
            # 编码结果
            for col, encoding in enumerate(encodings):
                result = char_data['encodings'].get(encoding, {})
                if result.get('success'):
                    value = result['hex']
                else:
                    value = 'N/A'
                
                encoding_item = QTableWidgetItem(value)
                encoding_item.setFont(QFont('Courier New', 10))
                self.table_view.setItem(row, 3 + col, encoding_item)
                
        # 调整列宽
        self.table_view.resizeColumnsToContents()
        
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
            if char_data.get('unicode_name'):
                content += f"名称: {char_data['unicode_name']}\n"
                
            for encoding, result in char_data['encodings'].items():
                if result.get('success'):
                    content += f"  {encoding.upper()}: {result['hex']}\n"
                    
        self.raw_view.setPlainText(content)
        
    def switch_view(self, index):
        """切换视图"""
        self.results_stack.setCurrentIndex(index)
        
        # 更新按钮样式
        for i, button in enumerate(self.view_btn_group.buttons()):
            if i == index:
                button.setStyleSheet(button.styleSheet().replace('background: #f8fafc', 'background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #667eea, stop:1 #764ba2)').replace('color: #2d3748', 'color: white'))
            else:
                button.setStyleSheet(button.styleSheet().replace('background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #667eea, stop:1 #764ba2)', 'background: #f8fafc').replace('color: white', 'color: #2d3748'))
                
    def clear_text(self):
        """清空文本"""
        self.text_input.clear()
        self.clear_results()
        
    def clear_results(self):
        """清空结果"""
        self.conversion_results = None
        
        # 清空字符视图
        while self.char_layout.count():
            child = self.char_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
                
        # 清空表格
        self.table_view.setRowCount(0)
        
        # 清空原始数据
        self.raw_view.clear()
        
        # 重置统计
        for label in self.stats_labels.values():
            label.setText("0")
            
    def paste_text(self):
        """粘贴文本"""
        clipboard = QApplication.clipboard()
        text = clipboard.text()
        if text:
            self.text_input.setPlainText(text)
            
    def copy_results(self):
        """复制结果"""
        if not self.conversion_results:
            return
            
        content = self.raw_view.toPlainText()
        QApplication.clipboard().setText(content)
        self.statusBar().showMessage("结果已复制到剪贴板", 2000)
        
    def select_file(self, event=None):
        """选择文件"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, 
            "选择文本文件", 
            "", 
            "文本文件 (*.txt *.csv *.json *.xml *.html);;所有文件 (*)"
        )
        
        if file_path:
            self.load_file(file_path)
            
    def load_file(self, file_path):
        """加载文件"""
        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                
            # 检测编码
            detected = chardet.detect(raw_data)
            encoding = detected['encoding'] or 'utf-8'
            
            # 解码文本
            text = raw_data.decode(encoding, errors='ignore')
            
            # 显示在输入框
            self.text_input.setPlainText(text)
            
            # 更新编码信息
            confidence = detected.get('confidence', 0) * 100
            self.encoding_info.setText(f"📋 {encoding} ({confidence:.0f}%)")
            
            self.statusBar().showMessage(f"文件已加载: {Path(file_path).name}", 3000)
            
        except Exception as e:
            QMessageBox.warning(self, "错误", f"无法加载文件: {str(e)}")
            
    def detect_encoding(self):
        """检测当前文本编码"""
        if not self.current_text:
            QMessageBox.information(self, "提示", "请先输入文本")
            return
            
        # 这里可以添加更详细的编码检测逻辑
        QMessageBox.information(self, "编码检测", "当前文本编码: UTF-8")
        
    def export_results(self):
        """导出结果"""
        if not self.conversion_results:
            QMessageBox.information(self, "提示", "没有可导出的结果")
            return
            
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "保存结果",
            f"encoding_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
            "文本文件 (*.txt);;JSON文件 (*.json);;所有文件 (*)"
        )
        
        if file_path:
            try:
                if file_path.endswith('.json'):
                    # 保存为JSON格式
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(self.conversion_results, f, ensure_ascii=False, indent=2)
                else:
                    # 保存为文本格式
                    content = self.raw_view.toPlainText()
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                        
                self.statusBar().showMessage(f"结果已保存: {Path(file_path).name}", 3000)
                
            except Exception as e:
                QMessageBox.warning(self, "错误", f"保存失败: {str(e)}")
                
    def show_about(self):
        """显示关于对话框"""
        QMessageBox.about(self, "关于", 
            """<h3>✨ 字符编码转换器 Pro</h3>
            <p>版本: 2.0</p>
            <p>一个现代化的字符编码转换工具</p>
            <p>支持多种编码格式的实时转换和预览</p>
            <br>
            <p>功能特点:</p>
            <ul>
            <li>🎯 实时字符编码转换</li>
            <li>📊 详细的统计信息</li>
            <li>🎨 现代化的用户界面</li>
            <li>📁 文件拖拽支持</li>
            <li>💾 多格式导出</li>
            </ul>
            """)

class FlowLayout(QLayout):
    """流式布局"""
    def __init__(self, parent=None, margin=0, spacing=-1):
        super().__init__(parent)
        if parent is not None:
            self.setContentsMargins(margin, margin, margin, margin)
        self.setSpacing(spacing)
        self.item_list = []

    def __del__(self):
        item = self.takeAt(0)
        while item:
            item = self.takeAt(0)

    def addItem(self, item):
        self.item_list.append(item)

    def count(self):
        return len(self.item_list)

    def itemAt(self, index):
        if 0 <= index < len(self.item_list):
            return self.item_list[index]
        return None

    def takeAt(self, index):
        if 0 <= index < len(self.item_list):
            return self.item_list.pop(index)
        return None

    def expandingDirections(self):
        return Qt.Orientation(0)

    def hasHeightForWidth(self):
        return True

    def heightForWidth(self, width):
        height = self._do_layout(QRect(0, 0, width, 0), True)
        return height

    def setGeometry(self, rect):
        super().setGeometry(rect)
        self._do_layout(rect, False)

    def sizeHint(self):
        return self.minimumSize()

    def minimumSize(self):
        size = QSize()
        for item in self.item_list:
            size = size.expandedTo(item.minimumSize())
        margin, _, _, _ = self.getContentsMargins()
        size += QSize(2 * margin, 2 * margin)
        return size

    def _do_layout(self, rect, test_only):
        x = rect.x()
        y = rect.y()
        line_height = 0

        for item in self.item_list:
            wid = item.widget()
            space_x = self.spacing() + wid.style().layoutSpacing(
                QSizePolicy.ControlType.PushButton, QSizePolicy.ControlType.PushButton, 
                Qt.Orientation.Horizontal)
            space_y = self.spacing() + wid.style().layoutSpacing(
                QSizePolicy.ControlType.PushButton, QSizePolicy.ControlType.PushButton, 
                Qt.Orientation.Vertical)
            
            next_x = x + item.sizeHint().width() + space_x
            if next_x - space_x > rect.right() and line_height > 0:
                x = rect.x()
                y = y + line_height + space_y
                next_x = x + item.sizeHint().width() + space_x
                line_height = 0

            if not test_only:
                item.setGeometry(QRect(QPoint(x, y), item.sizeHint()))

            x = next_x
            line_height = max(line_height, item.sizeHint().height())

        return y + line_height - rect.y()

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("字符编码转换器 Pro")
    app.setApplicationVersion("2.0")
    
    # 设置应用图标
    app.setWindowIcon(app.style().standardIcon(QStyle.StandardPixmap.SP_ComputerIcon))
    
    window = EncodingConverter()
    window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 