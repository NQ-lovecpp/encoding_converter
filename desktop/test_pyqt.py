import sys
try:
    from PyQt6.QtWidgets import QApplication, QLabel, QWidget
    from PyQt6.QtCore import Qt
    print("PyQt6导入成功！")
    
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle("测试PyQt6")
    window.resize(300, 200)
    
    label = QLabel("PyQt6正常工作！", window)
    label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    label.resize(200, 50)
    label.move(50, 75)
    
    window.show()
    print("窗口创建成功，PyQt6工作正常")
    sys.exit(app.exec())
    
except ImportError as e:
    print(f"PyQt6导入失败: {e}")
    print("正在尝试安装必要的组件...")
    
except Exception as e:
    print(f"其他错误: {e}") 