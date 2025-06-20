// 应用状态管理
const appState = {
    availableEncodings: [],
    selectedEncodings: new Set(),
    conversionResults: null,
    currentText: '',
    isLoading: false
};

// 配置
const CONFIG = {
    API_BASE_URL: 'http://localhost:15000/api',
    MAX_TEXT_LENGTH: 10000,
    DEFAULT_ENCODINGS: ['utf-8', 'utf-16', 'gbk', 'ascii']
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// 初始化函数
async function initializeApp() {
    try {
        showLoading(true);
        await loadEncodings();
        setupEventListeners();
        updateUI();
        showNotification('转换器已就绪！', 'success');
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('初始化失败，请刷新页面重试', 'error');
    } finally {
        showLoading(false);
    }
}

// 设置事件监听器
function setupEventListeners() {
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyAllBtn');
    const shareBtn = document.getElementById('shareBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 文本输入事件
    if (textInput) {
        textInput.addEventListener('input', handleTextInput);
        textInput.addEventListener('paste', handlePaste);
    }

    // 文件上传事件
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // 按钮事件
    if (convertBtn) convertBtn.addEventListener('click', convertText);
    if (clearBtn) clearBtn.addEventListener('click', clearText);
    if (copyBtn) copyBtn.addEventListener('click', copyAllResults);
    if (shareBtn) shareBtn.addEventListener('click', shareResults);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadResults);

    // 视图切换
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchView(e.target.dataset.view);
        });
    });

    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
}

// 加载可用编码
async function loadEncodings() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/encodings`);
        const data = await response.json();
        
        if (data.success && data.encodings) {
            appState.availableEncodings = data.encodings;
            populateEncodingSelector(data.encodings);
        } else {
            throw new Error(data.error || 'Failed to load encodings');
        }
    } catch (error) {
        console.error('Error loading encodings:', error);
        // 使用默认编码作为后备
        const defaultEncodings = CONFIG.DEFAULT_ENCODINGS.map(name => ({
            name: name,
            display_name: name.toUpperCase(),
            description: `${name.toUpperCase()} 编码`
        }));
        appState.availableEncodings = defaultEncodings;
        populateEncodingSelector(defaultEncodings);
        showNotification('使用默认编码列表', 'warning');
    }
}

// 填充编码选择器
function populateEncodingSelector(encodings) {
    const container = document.getElementById('encodingOptions');
    if (!container) return;

    container.innerHTML = '';
    
    encodings.forEach(encoding => {
        const option = document.createElement('div');
        option.className = 'encoding-option';
        
        const isSelected = CONFIG.DEFAULT_ENCODINGS.includes(encoding.name);
        if (isSelected) {
            appState.selectedEncodings.add(encoding.name);
        }

        option.innerHTML = `
            <label class="encoding-label">
                <input type="checkbox" 
                       value="${encoding.name}" 
                       ${isSelected ? 'checked' : ''}
                       onchange="toggleEncoding('${encoding.name}')">
                <span class="checkmark"></span>
                <div class="encoding-info">
                    <span class="encoding-name">${encoding.display_name || encoding.name}</span>
                    <span class="encoding-desc">${encoding.description || ''}</span>
                </div>
            </label>
        `;
        
        container.appendChild(option);
    });

    updateDownloadButton();
}

// 切换编码选择
function toggleEncoding(encodingName) {
    if (appState.selectedEncodings.has(encodingName)) {
        appState.selectedEncodings.delete(encodingName);
    } else {
        appState.selectedEncodings.add(encodingName);
    }
    updateDownloadButton();
}

// 处理文本输入
function handleTextInput(event) {
    const text = event.target.value;
    appState.currentText = text;
    
    // 更新字符计数
    updateCharacterCount(text);
    
    // 实时转换（可选，可以添加防抖）
    if (text.length > 0 && text.length < 100) {
        debounce(convertText, 500)();
    }
}

// 处理粘贴事件
function handlePaste(event) {
    setTimeout(() => {
        const text = event.target.value;
        if (text.length > CONFIG.MAX_TEXT_LENGTH) {
            event.target.value = text.substring(0, CONFIG.MAX_TEXT_LENGTH);
            showNotification(`文本过长，已截取到 ${CONFIG.MAX_TEXT_LENGTH} 字符`, 'warning');
        }
        updateCharacterCount(event.target.value);
    }, 0);
}

// 处理文件上传
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await readFileAsText(file);
        document.getElementById('textInput').value = text;
        appState.currentText = text;
        updateCharacterCount(text);
        showNotification('文件上传成功！', 'success');
    } catch (error) {
        console.error('File upload error:', error);
        showNotification('文件读取失败：' + error.message, 'error');
    }
}

// 读取文件为文本
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file, 'UTF-8');
    });
}

// 转换文本
async function convertText() {
    const text = document.getElementById('textInput').value.trim();
    
    if (!text) {
        showNotification('请输入要转换的文本', 'warning');
        return;
    }

    if (appState.selectedEncodings.size === 0) {
        showNotification('请至少选择一种编码格式', 'warning');
        return;
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                encodings: Array.from(appState.selectedEncodings)
            })
        });

        const result = await response.json();
        
        if (result.success) {
            appState.conversionResults = result.results;
            updateUI();
            
            // 保存到历史记录
            saveToHistory({
                type: 'convert',
                title: '文本编码转换',
                content: text,
                encodings: Array.from(appState.selectedEncodings),
                stats: {
                    characters: text.length,
                    bytes: extractByteStats(result.results),
                    efficiency: calculateEfficiency(result.results)
                }
            });
            
            showNotification('转换完成！', 'success');
        } else {
            throw new Error(result.error || '转换失败');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showNotification('转换失败：' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 提取字节统计信息
function extractByteStats(results) {
    const stats = {};
    if (results.overall) {
        Object.keys(results.overall).forEach(encoding => {
            const result = results.overall[encoding];
            if (result.success) {
                stats[encoding] = result.length || 0;
            }
        });
    }
    return stats;
}

// 计算编码效率
function calculateEfficiency(results) {
    if (!results.stats || !results.overall) return 0;
    
    const charCount = results.stats.length || 0;
    const encodings = Object.keys(results.overall);
    let totalBytes = 0;
    let successCount = 0;

    encodings.forEach(encoding => {
        const result = results.overall[encoding];
        if (result.success) {
            totalBytes += result.length || 0;
            successCount++;
        }
    });

    if (successCount === 0) return 0;
    const avgBytes = totalBytes / successCount;
    return Math.round((charCount / avgBytes) * 100);
}

// 保存到历史记录
function saveToHistory(record) {
    try {
        const history = JSON.parse(localStorage.getItem('encodingHistory') || '[]');
        const newRecord = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            favorite: false,
            ...record
        };
        
        history.unshift(newRecord);
        
        // 限制历史记录数量
        if (history.length > 1000) {
            history.splice(1000);
        }
        
        localStorage.setItem('encodingHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

// 更新UI
function updateUI() {
    updateStats();
    updateCharacterView();
    updateTableView();
    updateRawView();
    updateDownloadButton();
}

// 更新统计信息
function updateStats() {
    const stats = appState.conversionResults?.stats;
    const overall = appState.conversionResults?.overall;
    
    if (!stats || !overall) {
        document.getElementById('charCount').textContent = '0';
        document.getElementById('uniqueChars').textContent = '0';
        document.getElementById('byteCount').textContent = '0';
        return;
    }

    document.getElementById('charCount').textContent = stats.length || 0;
    document.getElementById('uniqueChars').textContent = stats.unique_chars || 0;
    
    // 计算总字节数（UTF-8）
    const utf8Result = overall['utf-8'];
    if (utf8Result && utf8Result.success) {
        document.getElementById('byteCount').textContent = utf8Result.length || 0;
    }
}

// 更新字符视图
function updateCharacterView() {
    const container = document.getElementById('characterView');
    if (!container) return;

    const characters = appState.conversionResults?.characters;
    if (!characters || !Array.isArray(characters)) {
        container.innerHTML = '<p class="no-data">暂无数据</p>';
        return;
    }

    const html = characters.map(char => {
        const encodings = Object.keys(char.encodings || {})
            .map(enc => {
                const result = char.encodings[enc];
                const status = result.success ? 'success' : 'error';
                const hex = result.success ? result.hex : 'Error';
                return `<span class="encoding-result ${status}">${enc}: ${hex}</span>`;
            })
            .join('');

        return `
            <div class="character-card">
                <div class="char-display">${char.char}</div>
                <div class="char-info">
                    <div class="unicode-info">
                        <span class="unicode">${char.unicode}</span>
                        <span class="unicode-name">${char.unicode_name || ''}</span>
                    </div>
                    <div class="encodings">
                        ${encodings}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// 更新表格视图
function updateTableView() {
    const tbody = document.querySelector('#tableView tbody');
    if (!tbody) return;

    const characters = appState.conversionResults?.characters;
    if (!characters || !Array.isArray(characters)) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">暂无数据</td></tr>';
        return;
    }

    const html = characters.map(char => {
        const encodings = char.encodings || {};
        const utf8 = encodings['utf-8'] || {};
        const utf16 = encodings['utf-16'] || {};
        const gbk = encodings['gbk'] || {};

        return `
            <tr>
                <td class="char-cell">${char.char}</td>
                <td>${char.unicode}</td>
                <td class="hex-cell">${utf8.hex || 'N/A'}</td>
                <td class="hex-cell">${utf16.hex || 'N/A'}</td>
                <td class="hex-cell">${gbk.hex || 'N/A'}</td>
                <td>${char.unicode_name || 'N/A'}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

// 更新原始数据视图
function updateRawView() {
    const container = document.getElementById('rawView');
    if (!container) return;

    const overall = appState.conversionResults?.overall;
    if (!overall) {
        container.innerHTML = '<p class="no-data">暂无数据</p>';
        return;
    }

    const html = Object.keys(overall).map(encoding => {
        const result = overall[encoding];
        const status = result.success ? 'success' : 'error';
        const content = result.success ? 
            `<div class="hex-display">${result.hex}</div>
             <div class="bytes-info">字节数: ${result.length}</div>` :
            `<div class="error-message">${result.error}</div>`;

        return `
            <div class="encoding-result-card ${status}">
                <div class="encoding-header">
                    <h4>${encoding.toUpperCase()}</h4>
                    <span class="status-badge ${status}">
                        ${result.success ? '成功' : '失败'}
                    </span>
                </div>
                <div class="encoding-content">
                    ${content}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// 切换视图
function switchView(viewName) {
    // 更新标签页
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.view-tab[data-view="${viewName}"]`).classList.add('active');

    // 更新视图内容
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');
}

// 更新字符计数
function updateCharacterCount(text) {
    const count = text.length;
    const counter = document.getElementById('characterCount');
    if (counter) {
        counter.textContent = `${count}/${CONFIG.MAX_TEXT_LENGTH}`;
        counter.className = count > CONFIG.MAX_TEXT_LENGTH ? 'over-limit' : '';
    }
}

// 更新下载按钮状态
function updateDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (!downloadBtn) return;

    const hasResults = appState.conversionResults !== null;
    const hasSelections = appState.selectedEncodings.size > 0;
    
    downloadBtn.disabled = !hasResults || !hasSelections;
}

// 清空文本
function clearText() {
    document.getElementById('textInput').value = '';
    appState.currentText = '';
    appState.conversionResults = null;
    updateCharacterCount('');
    updateUI();
    showNotification('内容已清空', 'info');
}

// 复制所有结果
async function copyAllResults() {
    if (!appState.conversionResults) {
        showNotification('没有可复制的结果', 'warning');
        return;
    }

    try {
        const text = formatResultsForCopy();
        await navigator.clipboard.writeText(text);
        showNotification('结果已复制到剪贴板', 'success');
    } catch (error) {
        console.error('Copy error:', error);
        showNotification('复制失败', 'error');
    }
}

// 格式化结果用于复制
function formatResultsForCopy() {
    const results = appState.conversionResults;
    let text = `文本: ${appState.currentText}\n\n`;
    
    if (results.overall) {
        text += '编码结果:\n';
        Object.keys(results.overall).forEach(encoding => {
            const result = results.overall[encoding];
            if (result.success) {
                text += `${encoding.toUpperCase()}: ${result.hex} (${result.length} 字节)\n`;
            } else {
                text += `${encoding.toUpperCase()}: 编码失败\n`;
            }
        });
    }
    
    return text;
}

// 分享结果
async function shareResults() {
    if (!appState.conversionResults) {
        showNotification('没有可分享的结果', 'warning');
        return;
    }

    const shareData = {
        title: '字符编码转换结果',
        text: formatResultsForCopy(),
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.text);
            showNotification('结果已复制到剪贴板，可以粘贴分享', 'success');
        }
    } catch (error) {
        console.error('Share error:', error);
        showNotification('分享失败', 'error');
    }
}

// 下载结果
function downloadResults() {
    if (!appState.conversionResults) {
        showNotification('没有可下载的结果', 'warning');
        return;
    }

    const content = formatResultsForDownload();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `encoding_results_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('结果已下载', 'success');
}

// 格式化结果用于下载
function formatResultsForDownload() {
    const results = appState.conversionResults;
    let content = `字符编码转换结果\n`;
    content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += `原始文本: ${appState.currentText}\n\n`;
    
    if (results.stats) {
        content += `统计信息:\n`;
        content += `- 字符数: ${results.stats.length}\n`;
        content += `- 唯一字符数: ${results.stats.unique_chars}\n\n`;
    }
    
    if (results.overall) {
        content += `整体编码结果:\n`;
        Object.keys(results.overall).forEach(encoding => {
            const result = results.overall[encoding];
            content += `\n${encoding.toUpperCase()}:\n`;
            if (result.success) {
                content += `  十六进制: ${result.hex}\n`;
                content += `  字节数: ${result.length}\n`;
                content += `  字节数组: [${result.bytes?.join(', ') || 'N/A'}]\n`;
            } else {
                content += `  错误: ${result.error}\n`;
            }
        });
    }
    
    if (results.characters && results.characters.length > 0) {
        content += `\n\n字符详细信息:\n`;
        results.characters.forEach((char, index) => {
            content += `\n字符 ${index + 1}: "${char.char}"\n`;
            content += `  Unicode: ${char.unicode}\n`;
            content += `  名称: ${char.unicode_name || 'N/A'}\n`;
            if (char.encodings) {
                Object.keys(char.encodings).forEach(encoding => {
                    const result = char.encodings[encoding];
                    if (result.success) {
                        content += `  ${encoding.toUpperCase()}: ${result.hex} (${result.length} 字节)\n`;
                    }
                });
            }
        });
    }
    
    return content;
}

// 切换主题
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// 打开设置
function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 关闭设置
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示加载状态
function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
    appState.isLoading = show;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: var(--glass-backdrop);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 15px 20px;
        color: white;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // 根据类型设置颜色
    const colors = {
        success: 'var(--success-gradient)',
        error: 'var(--secondary-gradient)',
        warning: 'var(--warning-gradient)',
        info: 'var(--accent-gradient)'
    };
    
    if (colors[type]) {
        notification.style.background = colors[type];
    }
    
    document.body.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 防抖函数
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

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 设置模态框事件
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeSettings();
    }
}); 