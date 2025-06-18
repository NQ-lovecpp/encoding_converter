import sys
import chardet
import codecs
import random
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QPushButton,
    QTextEdit, QLabel, QFileDialog, QComboBox, QMessageBox, QScrollArea
)
from PyQt5.QtGui import QTextCursor
from PyQt5.QtCore import Qt

class Converter(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("字符编码转换器（增强版）")
        self.resize(900, 700)

        layout = QVBoxLayout()

        self.fileLabel = QLabel("当前打开文件: 未选择")
        layout.addWidget(self.fileLabel)

        self.encodeSelect = QComboBox()
        self.encodeSelect.addItems(["utf-8", "utf-16", "gbk", "ascii"])
        layout.addWidget(QLabel("目标编码格式"))
        layout.addWidget(self.encodeSelect)

        openBtn = QPushButton("打开文件")
        openBtn.clicked.connect(self.open_file)
        layout.addWidget(openBtn)

        saveBtn = QPushButton("保存为目标编码")
        saveBtn.clicked.connect(self.save_as)
        layout.addWidget(saveBtn)

        showBtn = QPushButton("显示字符编码（对照）")
        showBtn.clicked.connect(self.show_encodings)
        layout.addWidget(showBtn)

        # 用于显示对照结果
        self.resultText = QTextEdit()
        self.resultText.setReadOnly(True)
        layout.addWidget(self.resultText)

        self.setLayout(layout)
        self.current_file = None
        self.current_encoding = "utf-8"

    def open_file(self):
        fname, _ = QFileDialog.getOpenFileName(self, "选择文本文件", "", "文本文件 (*.txt)")
        if fname:
            with open(fname, 'rb') as f:
                raw_data = f.read()
                detect = chardet.detect(raw_data)
                self.current_encoding = detect['encoding']
            try:
                with open(fname, 'r', encoding=self.current_encoding, errors='ignore') as f:
                    self.file_text = f.read()
                    self.fileLabel.setText(f"当前打开文件: {fname}（编码: {self.current_encoding}）")
                    self.current_file = fname
                    self.resultText.setHtml("")  # 清空原内容
            except Exception as e:
                QMessageBox.warning(self, "错误", f"打开失败：{e}")

    def save_as(self):
        if not self.current_file:
            QMessageBox.warning(self, "提示", "请先打开一个文件")
            return
        out_path, _ = QFileDialog.getSaveFileName(self, "保存为", "", "文本文件 (*.txt)")
        if out_path:
            try:
                with codecs.open(out_path, 'w', self.encodeSelect.currentText()) as f:
                    f.write(self.file_text)
                QMessageBox.information(self, "成功", "文件已成功保存")
            except Exception as e:
                QMessageBox.warning(self, "保存失败", str(e))

    def get_color(self, idx):
        colors = ["#e6f7ff", "#fff7e6", "#f9f0ff", "#f6ffed", "#fff1f0", "#e8f5e9"]
        return colors[idx % len(colors)]

    def show_encodings(self):
        if not hasattr(self, 'file_text') or not self.file_text:
            QMessageBox.warning(self, "提示", "请先打开一个文件")
            return

        html = "<h3>原文与编码对照</h3><pre style='font-family: Consolas;'>"
        for idx, ch in enumerate(self.file_text):
            bg = self.get_color(idx)
            try:
                ascii_code = ch.encode('ascii').hex()
            except:
                ascii_code = "N/A"
            try:
                utf8_code = ch.encode('utf-8').hex()
            except:
                utf8_code = "N/A"
            try:
                utf16_code = ch.encode('utf-16').hex()
            except:
                utf16_code = "N/A"
            html += (
                f"<span style='background-color:{bg}; padding:2px;'>"
                f"[{ch}] ASCII: {ascii_code:<6} UTF-8: {utf8_code:<12} UTF-16: {utf16_code}"
                f"</span><br>"
            )
        html += "</pre>"

        self.resultText.setHtml(html)
        self.resultText.moveCursor(QTextCursor.Start)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = Converter()
    window.show()
    sys.exit(app.exec_())
