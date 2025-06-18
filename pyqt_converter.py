import sys
import chardet
import codecs
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QPushButton,
    QTextEdit, QLabel, QFileDialog, QComboBox, QMessageBox
)

class Converter(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("字符编码转换器")
        self.resize(800, 600)

        # 主布局
        layout = QVBoxLayout()

        self.inputText = QTextEdit()
        layout.addWidget(QLabel("原文内容"))
        layout.addWidget(self.inputText)

        self.resultText = QTextEdit()
        layout.addWidget(QLabel("编码显示（每字符）"))
        layout.addWidget(self.resultText)

        self.encodeSelect = QComboBox()
        self.encodeSelect.addItems(["utf-8", "utf-16", "gbk", "ascii"])
        layout.addWidget(QLabel("目标编码格式"))
        layout.addWidget(self.encodeSelect)

        # 按钮
        openBtn = QPushButton("打开文件")
        openBtn.clicked.connect(self.open_file)
        layout.addWidget(openBtn)

        saveBtn = QPushButton("保存为目标编码")
        saveBtn.clicked.connect(self.save_as)
        layout.addWidget(saveBtn)

        showBtn = QPushButton("显示字符编码")
        showBtn.clicked.connect(self.show_encodings)
        layout.addWidget(showBtn)

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
                    text = f.read()
                    self.inputText.setPlainText(text)
                    self.current_file = fname
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
                    f.write(self.inputText.toPlainText())
                QMessageBox.information(self, "成功", "文件已成功保存")
            except Exception as e:
                QMessageBox.warning(self, "保存失败", str(e))

    def show_encodings(self):
        text = self.inputText.toPlainText()
        result = ""
        for ch in text:
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
            result += f"{ch} => ASCII: {ascii_code}, UTF-8: {utf8_code}, UTF-16: {utf16_code}\n"
        self.resultText.setPlainText(result)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    converter = Converter()
    converter.show()
    sys.exit(app.exec_())
