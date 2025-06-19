# ✨ 字符编码转换器 Pro

一个现代化的字符编码转换工具，提供网页版和桌面版两种使用方式。

## 🌟 主要特性

### 🌐 网页版特性
- 🎨 现代化响应式界面设计
- 🔄 实时编码转换预览
- 📁 支持文件上传和下载
- 🎯 多种编码格式支持
- 💾 转换历史记录
- 🌙 深色模式支持
- 📱 移动端适配

### 🖥️ 桌面版特性
- 🎨 原生Tkinter界面
- ⚡ 快速响应，离线使用
- 📂 批量文件处理
- 🔍 自动编码检测
- 💾 历史记录管理
- 🎯 拖拽文件支持

## 🚀 快速开始

### 方法一：使用主启动器（推荐）

```bash
# 运行主启动器
python start.py
```

然后根据菜单选择：
1. 🌐 网页版
2. 🖥️ 桌面版
3. 🔧 环境检查

### 方法二：分别启动

#### 启动网页版
```bash
# 启动Flask后端服务
python backend/app.py

# 在另一个终端启动网页版
python start_web.py
```

#### 启动桌面版
```bash
python start_desktop.py
```

## 📋 系统要求

### 基本要求
- Python 3.7+
- Tkinter（通常Python自带）

### 网页版额外要求
```bash
pip install flask flask-cors chardet requests
```

### 完整安装
```bash
# 安装所有依赖
pip install -r requirements.txt
```

## 📁 项目结构

```
encoding_converter/
├── 📄 start.py                    # 主启动器
├── 📄 start_web.py               # 网页版启动器
├── 📄 start_desktop.py           # 桌面版启动器
├── 📄 requirements.txt           # 依赖包列表
├── 📄 README.md                  # 项目说明
├── 🗂️ backend/                   # 后端代码
│   ├── 📄 app.py                 # Flask应用
│   └── 📄 encoding_utils.py      # 编码工具
├── 🗂️ frontend/                  # 前端代码
│   ├── 📄 index.html             # 主页面
│   ├── 📄 styles.css             # 样式文件
│   └── 📄 script.js              # JavaScript代码
└── 🗂️ desktop/                   # 桌面版代码
    └── 📄 encoding_converter_tkinter.py  # Tkinter应用
```

## 🎯 支持的编码格式

- UTF-8
- UTF-16 (LE/BE)
- UTF-32 (LE/BE)
- GBK/GB2312
- Big5
- Shift_JIS
- EUC-JP
- EUC-KR
- ISO-8859-1
- Windows-1252
- ASCII

## 📖 使用说明

### 网页版使用
1. 启动后端服务和前端页面
2. 在文本框中输入要转换的内容
3. 选择目标编码格式
4. 查看实时转换结果
5. 可上传文件或下载结果

### 桌面版使用
1. 运行桌面版启动器
2. 在界面中输入文本或拖拽文件
3. 选择源编码和目标编码
4. 点击转换查看结果
5. 保存结果到文件

## 🔧 高级功能

### API接口（网页版）
- `GET /api/encodings` - 获取支持的编码列表
- `POST /api/convert` - 文本编码转换
- `POST /api/upload` - 文件上传转换
- `POST /api/detect` - 编码检测

### 桌面版功能
- 编码自动检测
- 批量文件处理
- 转换历史记录
- 文件拖拽支持

## 🐛 故障排除

### 常见问题

#### 1. PyQt6安装问题
如果遇到PyQt6的DLL加载错误，建议使用Tkinter版本：
```bash
python desktop/encoding_converter_tkinter.py
```

#### 2. 网页版404错误
确保先启动Flask后端服务：
```bash
python backend/app.py
```

#### 3. 端口冲突
如果5000端口被占用，可以修改`backend/app.py`中的端口号。

### 环境检查
运行环境检查来诊断问题：
```bash
python start.py
# 选择选项3进行环境检查
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## 👨‍💻 作者

字符编码转换器 Pro - 现代化编码转换工具

---

🎉 **享受编码转换的乐趣！** 🎉 