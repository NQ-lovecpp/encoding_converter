#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import chardet
import base64
import unicodedata
import json
import os
from pathlib import Path

# 创建Flask应用
app = Flask(__name__, 
           template_folder='../frontend',
           static_folder='../frontend',
           static_url_path='')

# 配置CORS
CORS(app)

# 支持的编码格式
SUPPORTED_ENCODINGS = [
    'utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'utf-32', 'utf-32le', 'utf-32be',
    'ascii', 'latin-1', 'cp1252', 'iso-8859-1', 'iso-8859-15',
    'gbk', 'gb2312', 'gb18030', 'big5', 'big5hkscs',
    'shift_jis', 'cp932', 'euc-jp', 'iso-2022-jp',
    'euc-kr', 'cp949', 'iso-2022-kr',
    'koi8-r', 'cp1251', 'iso-8859-5',
    'cp437', 'cp850', 'cp866'
]

# 路由：主页
@app.route('/')
def index():
    """返回主页"""
    return render_template('index.html')

# 路由：静态文件
@app.route('/<path:filename>')
def static_files(filename):
    """提供静态文件"""
    if filename.endswith(('.css', '.js', '.png', '.jpg', '.ico', '.svg')):
        return send_from_directory('../frontend', filename)
    return render_template('index.html')

# API路由：获取支持的编码列表
@app.route('/api/encodings', methods=['GET'])
def get_encodings():
    """获取支持的编码格式列表"""
    try:
        encodings_info = []
        for encoding in SUPPORTED_ENCODINGS:
            encodings_info.append({
                'name': encoding,
                'display_name': encoding.upper(),
                'description': get_encoding_description(encoding)
            })
        
        return jsonify({
            'success': True,
            'encodings': encodings_info,
            'count': len(encodings_info)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_encoding_description(encoding):
    """获取编码格式的描述"""
    descriptions = {
        'utf-8': 'Unicode (UTF-8) - 可变长度编码',
        'utf-16': 'Unicode (UTF-16) - 16位编码',
        'utf-16le': 'Unicode (UTF-16 Little Endian)',
        'utf-16be': 'Unicode (UTF-16 Big Endian)',
        'utf-32': 'Unicode (UTF-32) - 32位编码',
        'ascii': 'ASCII - 7位字符编码',
        'latin-1': 'Latin-1 (ISO 8859-1)',
        'cp1252': 'Windows-1252 (Western European)',
        'gbk': 'GBK - 中文字符编码',
        'gb2312': 'GB2312 - 简体中文',
        'big5': 'Big5 - 繁体中文',
        'shift_jis': 'Shift JIS - 日文编码',
        'euc-jp': 'EUC-JP - 日文编码',
        'euc-kr': 'EUC-KR - 韩文编码',
        'iso-8859-1': 'ISO 8859-1 - Western European',
        'koi8-r': 'KOI8-R - 俄文编码'
    }
    return descriptions.get(encoding, f'{encoding.upper()} 编码')

# API路由：文本编码转换
@app.route('/api/convert', methods=['POST'])
def convert_text():
    """转换文本编码"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_encodings = data.get('encodings', ['utf-8'])
        
        if not text:
            return jsonify({
                'success': False,
                'error': '文本不能为空'
            }), 400
        
        results = perform_encoding_conversion(text, target_encodings)
        
        return jsonify({
            'success': True,
            'results': results,
            'original_text': text
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def perform_encoding_conversion(text, target_encodings):
    """执行编码转换"""
    results = {
        'characters': [],
        'overall': {},
        'stats': {
            'length': len(text),
            'byte_count_utf8': len(text.encode('utf-8')),
            'unique_chars': len(set(text)),
            'line_count': text.count('\n') + 1 if text else 0
        }
    }
    
    # 字符级转换（只对前100个字符，避免性能问题）
    char_limit = min(100, len(text))
    for i, char in enumerate(text[:char_limit]):
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
        except ValueError:
            char_info['unicode_name'] = 'PRIVATE USE' if ord(char) >= 0xE000 else 'UNKNOWN'
        
        # 各种编码转换
        for encoding in target_encodings:
            if encoding in SUPPORTED_ENCODINGS:
                try:
                    encoded = char.encode(encoding)
                    char_info['encodings'][encoding] = {
                        'success': True,
                        'hex': encoded.hex().upper(),
                        'bytes': list(encoded),
                        'base64': base64.b64encode(encoded).decode('ascii'),
                        'length': len(encoded)
                    }
                except (UnicodeEncodeError, LookupError):
                    char_info['encodings'][encoding] = {
                        'success': False,
                        'error': 'Cannot encode'
                    }
        
        results['characters'].append(char_info)
    
    # 整体编码
    for encoding in target_encodings:
        if encoding in SUPPORTED_ENCODINGS:
            try:
                encoded = text.encode(encoding)
                results['overall'][encoding] = {
                    'success': True,
                    'hex': encoded.hex().upper(),
                    'bytes': list(encoded) if len(encoded) <= 1000 else list(encoded[:1000]) + ['...'],
                    'base64': base64.b64encode(encoded).decode('ascii'),
                    'length': len(encoded),
                    'size_mb': round(len(encoded) / 1024 / 1024, 4)
                }
            except (UnicodeEncodeError, LookupError):
                results['overall'][encoding] = {
                    'success': False,
                    'error': 'Cannot encode entire text'
                }
    
    return results

# API路由：编码检测
@app.route('/api/detect', methods=['POST'])
def detect_encoding():
    """检测文本编码"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({
                'success': False,
                'error': '文本不能为空'
            }), 400
        
        # 将文本编码为字节再检测
        text_bytes = text.encode('utf-8')
        detected = chardet.detect(text_bytes)
        
        return jsonify({
            'success': True,
            'detected_encoding': detected.get('encoding'),
            'confidence': detected.get('confidence', 0),
            'language': detected.get('language'),
            'original_text': text
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API路由：文件上传
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """处理文件上传"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '没有文件被上传'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '没有选择文件'
            }), 400
        
        # 读取文件内容
        file_content = file.read()
        
        # 检测编码
        detected = chardet.detect(file_content)
        encoding = detected.get('encoding', 'utf-8')
        confidence = detected.get('confidence', 0)
        
        # 解码文本
        try:
            text = file_content.decode(encoding, errors='ignore')
        except (UnicodeDecodeError, LookupError):
            text = file_content.decode('utf-8', errors='ignore')
            encoding = 'utf-8'
        
        return jsonify({
            'success': True,
            'text': text,
            'filename': file.filename,
            'size': len(file_content),
            'detected_encoding': encoding,
            'confidence': confidence,
            'stats': {
                'length': len(text),
                'lines': text.count('\n') + 1,
                'unique_chars': len(set(text))
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API路由：健康检查
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'version': '2.0',
        'supported_encodings_count': len(SUPPORTED_ENCODINGS)
    })

# 错误处理
@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return render_template('index.html')

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

def main():
    """主函数"""
    print("🚀 启动字符编码转换器 Pro")
    print("=" * 50)
    print("📡 Flask服务器启动中...")
    print("🌐 网页版: http://localhost:5000")
    print("🔧 API文档: http://localhost:5000/api/health")
    print("=" * 50)
    
    # 在调试模式下运行
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )

if __name__ == '__main__':
    main() 