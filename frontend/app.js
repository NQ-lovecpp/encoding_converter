// 应用配置
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    AUTO_CONVERT_DELAY: 500, // 500ms
    ANIMATION_DURATION: 300,
    DEFAULT_ENCODINGS: ['utf-8', 'utf-16', 'gbk', 'ascii']
};

// 应用状态
class AppState {
    constructor() {
        this.currentText = '';
        this.selectedEncodings = new Set(CONFIG.DEFAULT_ENCODINGS);
        this.currentView = 'characters';
        this.isLoading = false;
        this.theme = localStorage.getItem('theme') || 'light';
        this.language = localStorage.getItem('language') || 'zh';
        this.settings = {
            displayFormat: 'hex',
            byteSeparator: ' ',
            autoConvert: true,
            showUnicodeName: true
        };
        this.conversionResults = null;
        this.history = JSON.parse(localStorage.getItem('conversion_history') || '[]');
    }

    updateText(text) {
        this.currentText = text;
        if (this.settings.autoConvert && text.trim()) {
            this.debounceConvert();
        }
    }

    toggleEncoding(encoding) {
        if (this.selectedEncodings.has(encoding)) {
            this.selectedEncodings.delete(encoding);
        } else {
            this.selectedEncodings.add(encoding);
        }
        if (this.currentText.trim()) {
            this.debounceConvert();
        }
    }

    setView(view) {
        this.currentView = view;
        this.updateViewDisplay();
    }

    debounceConvert = debounce(() => {
        if (this.currentText.trim()) {
            convertText();
        }
    }, CONFIG.AUTO_CONVERT_DELAY);

    updateViewDisplay() {
        // 更新视图按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.currentView);
        });

        // 更新视图容器显示
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.toggle('active', 
                container.id === `${this.currentView}View`);
        });
    }

    saveToHistory(text, results) {
        const historyItem = {
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString(),
            encodings: Array.from(this.selectedEncodings),
            results: results
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        localStorage.setItem('conversion_history', JSON.stringify(this.history));
    }
}

// 实用工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.getElementById('notifications').appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.toggle('active', show);
    appState.isLoading = show;
}

function formatBytes(bytes, separator = ' ') {
    if (typeof bytes === 'string') return bytes;
    return Array.from(bytes).map(b => 
        b.toString(16).padStart(2, '0').toUpperCase()
    ).join(separator);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('已复制到剪贴板', 'success');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('已复制到剪贴板', 'success');
    });
}

// API 调用函数
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function convertText() {
    if (!appState.currentText.trim() || appState.selectedEncodings.size === 0) {
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetchAPI('/convert', {
            method: 'POST',
            body: JSON.stringify({
                text: appState.currentText,
                encodings: Array.from(appState.selectedEncodings)
            })
        });

        appState.conversionResults = response;
        appState.saveToHistory(appState.currentText, response);
        
        updateUI();
        showNotification('转换完成', 'success');
        
    } catch (error) {
        showNotification('转换失败: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function detectFileEncoding(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/detect`, {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        throw new Error('检测编码失败: ' + error.message);
    }
}

async function loadEncodings() {
    try {
        const encodings = await fetchAPI('/encodings');
        populateEncodingSelector(encodings);
    } catch (error) {
        console.error('Failed to load encodings:', error);
        // 使用默认编码
        populateEncodingSelector(CONFIG.DEFAULT_ENCODINGS);
    }
}

// UI 更新函数
function updateUI() {
    updateStats();
    updateCharacterView();
    updateTableView();
    updateRawView();
}

function updateStats() {
    if (!appState.conversionResults) return;
    
    const stats = appState.conversionResults.stats;
    document.getElementById('charCount').textContent = stats.length;
    document.getElementById('uniqueChars').textContent = stats.unique_chars;
    
    // 计算总字节数（以UTF-8为基准）
    const utf8Result = appState.conversionResults.overall['utf-8'];
    if (utf8Result && utf8Result.success) {
        document.getElementById('byteCount').textContent = utf8Result.length;
    }
}

function updateCharacterView() {
    if (!appState.conversionResults) return;
    
    const grid = document.getElementById('charactersGrid');
    grid.innerHTML = '';
    
    appState.conversionResults.characters.forEach((charData, index) => {
        const card = createCharacterCard(charData, index);
        grid.appendChild(card);
    });
}

function createCharacterCard(charData, index) {
    const card = document.createElement('div');
    card.className = 'character-card animate-fadeIn';
    card.style.animationDelay = `${index * 50}ms`;
    
    let encodingResults = '';
    appState.selectedEncodings.forEach(encoding => {
        const result = charData.encodings[encoding];
        if (result && result.success) {
            encodingResults += `
                <div class="encoding-result">
                    <span class="encoding-name">${encoding.toUpperCase()}</span>
                    <span class="encoding-value">${formatEncodingValue(result)}</span>
                </div>
            `;
        }
    });
    
    card.innerHTML = `
        <div class="char-display">${charData.char}</div>
        <div class="char-info">
            <div>${charData.unicode}</div>
            ${appState.settings.showUnicodeName ? `<div>${charData.unicode_name}</div>` : ''}
        </div>
        <div class="encoding-results">
            ${encodingResults}
        </div>
    `;
    
    // 添加点击复制功能
    card.addEventListener('click', () => {
        const copyData = generateCopyData(charData);
        copyToClipboard(copyData);
    });
    
    return card;
}

function formatEncodingValue(result) {
    switch (appState.settings.displayFormat) {
        case 'hex':
            return result.hex;
        case 'decimal':
            return result.bytes.join(appState.settings.byteSeparator);
        case 'binary':
            return result.bytes.map(b => b.toString(2).padStart(8, '0')).join(appState.settings.byteSeparator);
        case 'base64':
            return result.base64;
        default:
            return result.hex;
    }
}

function generateCopyData(charData) {
    let data = `字符: ${charData.char}\n`;
    data += `Unicode: ${charData.unicode}\n`;
    if (charData.unicode_name) {
        data += `名称: ${charData.unicode_name}\n`;
    }
    
    appState.selectedEncodings.forEach(encoding => {
        const result = charData.encodings[encoding];
        if (result && result.success) {
            data += `${encoding.toUpperCase()}: ${formatEncodingValue(result)}\n`;
        }
    });
    
    return data;
}

function updateTableView() {
    if (!appState.conversionResults) return;
    
    const table = document.getElementById('resultsTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // 更新表头
    thead.innerHTML = `
        <th>字符</th>
        <th>Unicode</th>
        ${appState.settings.showUnicodeName ? '<th>名称</th>' : ''}
        ${Array.from(appState.selectedEncodings).map(enc => 
            `<th>${enc.toUpperCase()}</th>`
        ).join('')}
    `;
    
    // 更新表格内容
    tbody.innerHTML = '';
    appState.conversionResults.characters.forEach(charData => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="char-cell">${charData.char}</td>
            <td>${charData.unicode}</td>
            ${appState.settings.showUnicodeName ? `<td>${charData.unicode_name}</td>` : ''}
            ${Array.from(appState.selectedEncodings).map(encoding => {
                const result = charData.encodings[encoding];
                const value = result && result.success ? formatEncodingValue(result) : 'N/A';
                return `<td class="encoding-cell">${value}</td>`;
            }).join('')}
        `;
        tbody.appendChild(row);
    });
}

function updateRawView() {
    if (!appState.conversionResults) return;
    
    const tabs = document.getElementById('encodingTabs');
    const content = document.getElementById('rawContent');
    
    // 更新标签页
    tabs.innerHTML = '';
    Array.from(appState.selectedEncodings).forEach((encoding, index) => {
        const tab = document.createElement('button');
        tab.className = `encoding-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = encoding.toUpperCase();
        tab.addEventListener('click', () => {
            document.querySelectorAll('.encoding-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showRawContent(encoding);
        });
        tabs.appendChild(tab);
    });
    
    // 显示第一个编码的内容
    const firstEncoding = Array.from(appState.selectedEncodings)[0];
    if (firstEncoding) {
        showRawContent(firstEncoding);
    }
}

function showRawContent(encoding) {
    const content = document.getElementById('rawContent');
    const result = appState.conversionResults.overall[encoding];
    
    if (result && result.success) {
        let displayText = '';
        switch (appState.settings.displayFormat) {
            case 'hex':
                displayText = result.hex;
                break;
            case 'decimal':
                displayText = result.bytes.join(appState.settings.byteSeparator);
                break;
            case 'binary':
                displayText = result.bytes.map(b => 
                    b.toString(2).padStart(8, '0')
                ).join(appState.settings.byteSeparator);
                break;
            case 'base64':
                displayText = result.base64;
                break;
            default:
                displayText = result.hex;
        }
        
        content.textContent = displayText;
    } else {
        content.textContent = '转换失败';
    }
}

function populateEncodingSelector(encodings) {
    const grid = document.getElementById('encodingGrid');
    grid.innerHTML = '';
    
    encodings.forEach(encoding => {
        const item = document.createElement('div');
        item.className = 'encoding-item';
        item.innerHTML = `
            <input type="checkbox" id="enc_${encoding}" ${
                appState.selectedEncodings.has(encoding) ? 'checked' : ''
            }>
            <label for="enc_${encoding}">${encoding.toUpperCase()}</label>
        `;
        
        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', () => {
            appState.toggleEncoding(encoding);
            item.classList.toggle('selected', checkbox.checked);
            updateDownloadButton();
        });
        
        if (appState.selectedEncodings.has(encoding)) {
            item.classList.add('selected');
        }
        
        grid.appendChild(item);
    });
}

function updateDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = !appState.conversionResults || appState.selectedEncodings.size === 0;
}

// 文件处理函数
function handleFileUpload(file) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showNotification('文件过大，请选择小于10MB的文件', 'error');
        return;
    }
    
    showLoading(true);
    
    detectFileEncoding(file).then(result => {
        document.getElementById('textInput').value = result.text_preview;
        appState.updateText(result.text_preview);
        
        const info = document.getElementById('inputEncodingInfo');
        info.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${result.encoding} (${Math.round(result.confidence * 100)}%)</span>
        `;
        
        showNotification(`检测到编码: ${result.encoding}`, 'success');
        
    }).catch(error => {
        showNotification(error.message, 'error');
    }).finally(() => {
        showLoading(false);
    });
}

// 事件监听器设置
function setupEventListeners() {
    // 文本输入
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('input', (e) => {
        appState.updateText(e.target.value);
        updateCharCounter();
    });
    
    // 字符计数器更新
    function updateCharCounter() {
        const text = textInput.value;
        document.getElementById('charCounter').textContent = `${text.length} 字符`;
    }
    
    // 文件上传
    const fileInput = document.getElementById('fileInput');
    const fileUploadArea = document.getElementById('fileUploadArea');
    
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // 拖拽上传
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // 视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.setView(btn.dataset.view);
        });
    });
    
    // 工具栏按钮
    document.getElementById('clearBtn').addEventListener('click', () => {
        textInput.value = '';
        appState.updateText('');
        updateCharCounter();
        clearResults();
    });
    
    document.getElementById('pasteBtn').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            appState.updateText(text);
            updateCharCounter();
        } catch (error) {
            showNotification('无法访问剪贴板', 'error');
        }
    });
    
    document.getElementById('copyBtn').addEventListener('click', () => {
        if (appState.conversionResults) {
            const copyData = generateFullCopyData();
            copyToClipboard(copyData);
        }
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (appState.conversionResults) {
            downloadResults();
        }
    });
    
    // 主题切换
    document.getElementById('themeToggle').addEventListener('click', () => {
        appState.theme = appState.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', appState.theme);
        localStorage.setItem('theme', appState.theme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = `fas fa-${appState.theme === 'light' ? 'moon' : 'sun'}`;
    });
    
    // 设置模态框
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const modalClose = settingsModal.querySelector('.modal-close');
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        loadSettings();
    });
    
    modalClose.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // 设置项
    document.getElementById('displayFormat').addEventListener('change', (e) => {
        appState.settings.displayFormat = e.target.value;
        updateUI();
    });
    
    document.getElementById('byteSeparator').addEventListener('input', (e) => {
        appState.settings.byteSeparator = e.target.value;
        updateUI();
    });
    
    document.getElementById('autoConvert').addEventListener('change', (e) => {
        appState.settings.autoConvert = e.target.checked;
    });
    
    document.getElementById('showUnicodeName').addEventListener('change', (e) => {
        appState.settings.showUnicodeName = e.target.checked;
        updateUI();
    });
}

function clearResults() {
    appState.conversionResults = null;
    document.getElementById('charactersGrid').innerHTML = '';
    document.getElementById('resultsTable').querySelector('tbody').innerHTML = '';
    document.getElementById('rawContent').textContent = '';
    updateStats();
}

function loadSettings() {
    document.getElementById('displayFormat').value = appState.settings.displayFormat;
    document.getElementById('byteSeparator').value = appState.settings.byteSeparator;
    document.getElementById('autoConvert').checked = appState.settings.autoConvert;
    document.getElementById('showUnicodeName').checked = appState.settings.showUnicodeName;
}

function generateFullCopyData() {
    if (!appState.conversionResults) return '';
    
    let data = `文本: "${appState.currentText}"\n`;
    data += `字符数: ${appState.conversionResults.stats.length}\n`;
    data += `唯一字符: ${appState.conversionResults.stats.unique_chars}\n\n`;
    
    data += '=== 字符详情 ===\n';
    appState.conversionResults.characters.forEach(charData => {
        data += generateCopyData(charData) + '\n';
    });
    
    return data;
}

function downloadResults() {
    const data = generateFullCopyData();
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `encoding_results_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showNotification('文件已下载', 'success');
}

// 应用初始化
let appState;

function initializeApp() {
    appState = new AppState();
    
    // 设置主题
    document.documentElement.setAttribute('data-theme', appState.theme);
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = `fas fa-${appState.theme === 'light' ? 'moon' : 'sun'}`;
    
    // 加载编码列表
    loadEncodings();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始化视图
    appState.updateViewDisplay();
    
    // 显示欢迎消息
    showNotification('编码转换器已就绪', 'success');
}

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initializeApp); 