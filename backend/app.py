from flask import Flask, request, jsonify
from flask_cors import CORS
import chardet
import base64
import binascii
import json
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

class EncodingConverter:
    ENCODINGS = [
        'utf-8', 'utf-16', 'utf-16le', 'utf-16be', 'utf-32',
        'ascii', 'latin-1', 'cp1252', 'gbk', 'gb2312', 
        'big5', 'shift_jis', 'euc-jp', 'iso-8859-1'
    ]
    
    @staticmethod
    def detect_encoding(data):
        """检测文本编码"""
        if isinstance(data, str):
            return 'utf-8'
        result = chardet.detect(data)
        return result['encoding'] or 'utf-8'
    
    @staticmethod
    def encode_text(text, encoding):
        """将文本编码为指定格式"""
        try:
            encoded = text.encode(encoding)
            return {
                'success': True,
                'hex': encoded.hex(),
                'bytes': list(encoded),
                'base64': base64.b64encode(encoded).decode('ascii'),
                'length': len(encoded)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def decode_text(data, encoding):
        """从指定编码解码文本"""
        try:
            if isinstance(data, str):
                # 处理十六进制字符串
                if all(c in '0123456789abcdefABCDEF' for c in data.replace(' ', '')):
                    data = bytes.fromhex(data.replace(' ', ''))
                else:
                    # 处理base64
                    data = base64.b64decode(data)
            
            decoded = data.decode(encoding)
            return {'success': True, 'text': decoded}
        except Exception as e:
            return {'success': False, 'error': str(e)}

@app.route('/api/encodings', methods=['GET'])
def get_encodings():
    """获取支持的编码列表"""
    return jsonify(EncodingConverter.ENCODINGS)

@app.route('/api/convert', methods=['POST'])
def convert_text():
    """实时转换文本编码"""
    data = request.get_json()
    text = data.get('text', '')
    target_encodings = data.get('encodings', ['utf-8'])
    
    if not text:
        return jsonify({'error': '文本不能为空'}), 400
    
    results = {}
    char_details = []
    
    # 为每个字符生成详细信息
    for i, char in enumerate(text):
        char_info = {
            'char': char,
            'unicode': f'U+{ord(char):04X}',
            'unicode_name': '',
            'position': i,
            'encodings': {}
        }
        
        # 尝试获取Unicode字符名称
        try:
            import unicodedata
            char_info['unicode_name'] = unicodedata.name(char, 'UNKNOWN')
        except:
            pass
        
        # 为每种编码生成信息
        for encoding in target_encodings:
            result = EncodingConverter.encode_text(char, encoding)
            char_info['encodings'][encoding] = result
        
        char_details.append(char_info)
    
    # 整体文本转换
    for encoding in target_encodings:
        results[encoding] = EncodingConverter.encode_text(text, encoding)
    
    return jsonify({
        'overall': results,
        'characters': char_details,
        'stats': {
            'length': len(text),
            'unique_chars': len(set(text)),
            'encodings_count': len(target_encodings)
        }
    })

@app.route('/api/detect', methods=['POST'])
def detect_encoding():
    """检测文件或文本编码"""
    if 'file' in request.files:
        file = request.files['file']
        content = file.read()
        detected = EncodingConverter.detect_encoding(content)
        
        # 尝试用检测到的编码解码
        try:
            text = content.decode(detected)
            return jsonify({
                'encoding': detected,
                'confidence': chardet.detect(content)['confidence'],
                'text_preview': text[:500] + ('...' if len(text) > 500 else ''),
                'file_size': len(content)
            })
        except:
            return jsonify({'error': '无法解码文件'}), 400
    else:
        text = request.get_json().get('text', '')
        return jsonify({
            'encoding': 'utf-8',
            'confidence': 1.0,
            'text_preview': text[:500]
        })

@app.route('/api/decode', methods=['POST'])
def decode_data():
    """解码数据"""
    data = request.get_json()
    encoded_data = data.get('data', '')
    encoding = data.get('encoding', 'utf-8')
    data_type = data.get('type', 'hex')  # hex, base64, bytes
    
    try:
        if data_type == 'hex':
            bytes_data = bytes.fromhex(encoded_data.replace(' ', ''))
        elif data_type == 'base64':
            bytes_data = base64.b64decode(encoded_data)
        else:
            return jsonify({'error': '不支持的数据类型'}), 400
        
        result = EncodingConverter.decode_text(bytes_data, encoding)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/file/convert', methods=['POST'])
def convert_file():
    """文件编码转换"""
    file = request.files['file']
    source_encoding = request.form.get('source_encoding', 'auto')
    target_encoding = request.form.get('target_encoding', 'utf-8')
    
    content = file.read()
    
    if source_encoding == 'auto':
        source_encoding = EncodingConverter.detect_encoding(content)
    
    try:
        # 解码
        text = content.decode(source_encoding)
        
        # 重新编码
        converted = text.encode(target_encoding)
        
        # 返回转换后的文件信息
        return jsonify({
            'success': True,
            'original_size': len(content),
            'converted_size': len(converted),
            'source_encoding': source_encoding,
            'target_encoding': target_encoding,
            'preview': text[:200] + ('...' if len(text) > 200 else ''),
            'download_data': base64.b64encode(converted).decode('ascii')
        })
    except Exception as e:
        return jsonify({'error': f'转换失败: {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000) 