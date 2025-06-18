from flask import Flask, render_template, request, send_file
import os
import codecs
import chardet

app = Flask(__name__)
UPLOAD_FOLDER = 'D:/DSoftware/pycharm/project/pythonProject/hw_project/saved'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def encode_char(ch, encoding):
    try:
        return ch.encode(encoding).hex()
    except:
        return "N/A"

@app.route('/', methods=['GET', 'POST'])
def index():
    result_table = []
    original_text = ""
    selected_encoding = "utf-8"
    opened_filename = None

    if request.method == 'POST':
        selected_encoding = request.form.get('encoding', 'utf-8')

        # ✅ 如果上传了文件
        if 'file' in request.files and request.files['file'].filename != '':
            file = request.files['file']
            raw_data = file.read()
            encoding = chardet.detect(raw_data)['encoding'] or 'utf-8'
            original_text = raw_data.decode(encoding, errors='ignore')
            opened_filename = file.filename

        # ✅ 否则用文本框内容（如“刷新时保留文本”）
        else:
            original_text = request.form.get('text', '')

        # ✅ 不管是否点击“显示编码”或“保存”，原文都应该显示
        if 'show' in request.form:
            for ch in original_text:
                result_table.append({
                'char': ch,
                selected_encoding: encode_char(ch, selected_encoding)
            })

        # ✅ 保存按钮：保存为 hex 文件（不是原文）
        if 'save' in request.form:
            hex_str = ""
            for ch in original_text:
                hex_val = encode_char(ch, selected_encoding)
                hex_str += hex_val
            save_path = os.path.join(UPLOAD_FOLDER, 'hex_output.txt')
            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(hex_str)
            return send_file(save_path, as_attachment=True)

    return render_template('index.html',
                           original_text=original_text,
                           result_table=result_table,
                           selected_encoding=selected_encoding,
                           opened_filename=opened_filename)
                        
@app.route('/convert_encoding', methods=['GET', 'POST'])
def convert_encoding():
    message = ""
    if request.method == 'POST':
        file = request.files.get('file')
        source_enc = request.form.get('source_encoding')
        target_enc = request.form.get('target_encoding')

        if file and source_enc and target_enc:
            try:
                content = file.read().decode(source_enc, errors='ignore')
                save_path = os.path.join(UPLOAD_FOLDER, f"converted_{target_enc}.txt")
                with open(save_path, 'w', encoding=target_enc) as f:
                    f.write(content)
                return send_file(save_path, as_attachment=True)
            except Exception as e:
                message = f"转换失败：{e}"
        else:
            message = "请上传文件并选择编码格式"
    return render_template('convert_encoding.html', message=message)

if __name__ == '__main__':
    app.run(debug=True)