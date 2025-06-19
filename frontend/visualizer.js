// 图表实例存储
let charts = {
    byteDistribution: null,
    encodingEfficiency: null,
    characterType: null,
    sizeTrend: null
};

// 分析结果存储
let analysisData = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    analyzeText(); // 默认分析示例文本
});

// 初始化图表
function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: { family: 'Inter' }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: 'rgba(255,255,255,0.8)' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
                ticks: { color: 'rgba(255,255,255,0.8)' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };

    // 字节分布图
    charts.byteDistribution = new Chart(
        document.getElementById('byteDistributionChart'),
        {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: chartOptions
        }
    );

    // 编码效率对比
    charts.encodingEfficiency = new Chart(
        document.getElementById('encodingEfficiencyChart'),
        {
            type: 'radar',
            data: { labels: [], datasets: [] },
            options: {
                ...chartOptions,
                scales: {
                    r: {
                        ticks: { color: 'rgba(255,255,255,0.8)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: 'white' }
                    }
                }
            }
        }
    );

    // 字符类型分析
    charts.characterType = new Chart(
        document.getElementById('characterTypeChart'),
        {
            type: 'doughnut',
            data: { labels: [], datasets: [] },
            options: {
                ...chartOptions,
                scales: {}
            }
        }
    );

    // 编码大小趋势
    charts.sizeTrend = new Chart(
        document.getElementById('sizeTrendChart'),
        {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: {
                ...chartOptions,
                elements: {
                    line: { tension: 0.4 }
                }
            }
        }
    );
}

// 分析文本
async function analyzeText() {
    const text = document.getElementById('analysisText').value;
    const encoding = document.getElementById('encodingSelect').value;
    
    if (!text.trim()) {
        showNotification('请输入要分析的文本', 'warning');
        return;
    }

    try {
        // 显示加载状态
        showLoading(true);
        
        // 调用后端API进行分析
        const response = await fetch('http://localhost:5000/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                encodings: encoding === 'all' ? 
                    ['utf-8', 'utf-16', 'gbk', 'ascii'] : [encoding]
            })
        });

        const result = await response.json();
        if (result.success) {
            analysisData = processAnalysisData(result.results, text);
            updateVisualizations();
            showNotification('分析完成！', 'success');
        } else {
            throw new Error(result.error || '分析失败');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('分析失败: ' + error.message, 'error');
        // 使用模拟数据进行展示
        analysisData = generateMockData(text);
        updateVisualizations();
    } finally {
        showLoading(false);
    }
}

// 处理分析数据
function processAnalysisData(results, text) {
    const data = {
        text: text,
        characters: results.characters || [],
        overall: results.overall || {},
        stats: results.stats || {},
        encodings: {}
    };

    // 处理每个编码的数据
    Object.keys(data.overall).forEach(encoding => {
        const result = data.overall[encoding];
        if (result.success) {
            data.encodings[encoding] = {
                bytes: result.bytes || [],
                length: result.length || 0,
                hex: result.hex || '',
                efficiency: calculateEfficiency(text, result.length)
            };
        }
    });

    return data;
}

// 生成模拟数据（用于演示）
function generateMockData(text) {
    const characters = text.split('').map(char => {
        const codePoint = char.codePointAt(0);
        return {
            char: char,
            unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
            unicode_name: getUnicodeName(char),
            encodings: {
                'utf-8': {
                    success: true,
                    bytes: encodeUTF8(char),
                    length: encodeUTF8(char).length,
                    hex: encodeUTF8(char).map(b => b.toString(16).padStart(2, '0')).join(' ')
                },
                'utf-16': {
                    success: true,
                    bytes: encodeUTF16(char),
                    length: encodeUTF16(char).length,
                    hex: encodeUTF16(char).map(b => b.toString(16).padStart(2, '0')).join(' ')
                }
            }
        };
    });

    return {
        text: text,
        characters: characters,
        stats: {
            length: text.length,
            unique_chars: new Set(text).size
        },
        encodings: {
            'utf-8': {
                bytes: characters.flatMap(c => c.encodings['utf-8'].bytes),
                length: characters.reduce((sum, c) => sum + c.encodings['utf-8'].length, 0),
                efficiency: calculateEfficiency(text, characters.reduce((sum, c) => sum + c.encodings['utf-8'].length, 0))
            },
            'utf-16': {
                bytes: characters.flatMap(c => c.encodings['utf-16'].bytes),
                length: characters.reduce((sum, c) => sum + c.encodings['utf-16'].length, 0),
                efficiency: calculateEfficiency(text, characters.reduce((sum, c) => sum + c.encodings['utf-16'].length, 0))
            }
        }
    };
}

// 更新所有可视化
function updateVisualizations() {
    updateStatCards();
    updateByteDistributionChart();
    updateEncodingEfficiencyChart();
    updateCharacterTypeChart();
    updateSizeTrendChart();
    updateEncodingTable();
}

// 更新统计卡片
function updateStatCards() {
    const totalBytes = Object.values(analysisData.encodings)
        .reduce((sum, enc) => sum + enc.length, 0);
    
    const avgEfficiency = Object.values(analysisData.encodings)
        .reduce((sum, enc) => sum + enc.efficiency, 0) / 
        Object.keys(analysisData.encodings).length;

    const complexity = calculateComplexity(analysisData.text);
    const compatibility = calculateCompatibility(analysisData.encodings);

    document.getElementById('totalBytes').textContent = totalBytes;
    document.getElementById('efficiency').textContent = Math.round(avgEfficiency) + '%';
    document.getElementById('complexity').textContent = complexity.toFixed(1);
    document.getElementById('compatibility').textContent = Math.round(compatibility) + '%';
}

// 更新字节分布图
function updateByteDistributionChart() {
    const encodings = Object.keys(analysisData.encodings);
    const datasets = [{
        label: '字节数',
        data: encodings.map(enc => analysisData.encodings[enc].length),
        backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(245, 87, 108, 0.8)'
        ],
        borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(240, 147, 251, 1)',
            'rgba(245, 87, 108, 1)'
        ],
        borderWidth: 2
    }];

    charts.byteDistribution.data.labels = encodings.map(enc => enc.toUpperCase());
    charts.byteDistribution.data.datasets = datasets;
    charts.byteDistribution.update();
}

// 更新编码效率对比
function updateEncodingEfficiencyChart() {
    const metrics = ['空间效率', '兼容性', '处理速度', '国际化', '普及度'];
    const encodings = Object.keys(analysisData.encodings);
    
    const datasets = encodings.map((encoding, index) => {
        const colors = [
            'rgba(102, 126, 234, 0.6)',
            'rgba(118, 75, 162, 0.6)',
            'rgba(240, 147, 251, 0.6)',
            'rgba(245, 87, 108, 0.6)'
        ];
        
        return {
            label: encoding.toUpperCase(),
            data: getEncodingMetrics(encoding),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.6', '1'),
            borderWidth: 2
        };
    });

    charts.encodingEfficiency.data.labels = metrics;
    charts.encodingEfficiency.data.datasets = datasets;
    charts.encodingEfficiency.update();
}

// 更新字符类型分析
function updateCharacterTypeChart() {
    const typeCount = analyzeCharacterTypes(analysisData.text);
    
    const dataset = {
        data: Object.values(typeCount),
        backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(240, 147, 251, 0.8)',
            'rgba(245, 87, 108, 0.8)',
            'rgba(75, 192, 254, 0.8)',
            'rgba(0, 242, 254, 0.8)'
        ],
        borderWidth: 2
    };

    charts.characterType.data.labels = Object.keys(typeCount);
    charts.characterType.data.datasets = [dataset];
    charts.characterType.update();
}

// 更新编码大小趋势
function updateSizeTrendChart() {
    const characters = analysisData.text.split('');
    const encodings = Object.keys(analysisData.encodings);
    
    const datasets = encodings.map((encoding, index) => {
        const colors = [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(240, 147, 251, 1)',
            'rgba(245, 87, 108, 1)'
        ];
        
        let cumulativeSize = 0;
        const data = characters.map((char, i) => {
            const charData = analysisData.characters[i];
            if (charData && charData.encodings[encoding]) {
                cumulativeSize += charData.encodings[encoding].length;
            }
            return cumulativeSize;
        });
        
        return {
            label: encoding.toUpperCase(),
            data: data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
            fill: false,
            tension: 0.4
        };
    });

    charts.sizeTrend.data.labels = characters.map((_, i) => `字符 ${i + 1}`);
    charts.sizeTrend.data.datasets = datasets;
    charts.sizeTrend.update();
}

// 更新编码表格
function updateEncodingTable() {
    const tbody = document.getElementById('encodingTableBody');
    tbody.innerHTML = '';

    analysisData.characters.forEach(charData => {
        const row = document.createElement('tr');
        
        const utf8 = charData.encodings['utf-8'] || { hex: 'N/A', length: 0 };
        const utf16 = charData.encodings['utf-16'] || { hex: 'N/A', length: 0 };
        const gbk = charData.encodings['gbk'] || { hex: 'N/A', length: 0 };
        
        const avgBytes = (utf8.length + utf16.length + gbk.length) / 3;
        const efficiency = Math.round((1 / avgBytes) * 100);
        
        row.innerHTML = `
            <td>${charData.char}</td>
            <td>${charData.unicode}</td>
            <td><span class="byte-value">${utf8.hex}</span></td>
            <td><span class="byte-value">${utf16.hex}</span></td>
            <td><span class="byte-value">${gbk.hex}</span></td>
            <td>${avgBytes.toFixed(1)}</td>
            <td>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${efficiency}%"></div>
                </div>
                ${efficiency}%
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 辅助函数
function calculateEfficiency(text, byteCount) {
    return Math.round((text.length / byteCount) * 100);
}

function calculateComplexity(text) {
    const uniqueChars = new Set(text).size;
    const totalChars = text.length;
    const unicodeRanges = countUnicodeRanges(text);
    return (uniqueChars / totalChars) * unicodeRanges;
}

function calculateCompatibility(encodings) {
    const weights = { 'utf-8': 30, 'utf-16': 25, 'ascii': 20, 'gbk': 15 };
    let totalWeight = 0;
    let availableWeight = 0;
    
    Object.keys(weights).forEach(encoding => {
        totalWeight += weights[encoding];
        if (encodings[encoding]) {
            availableWeight += weights[encoding];
        }
    });
    
    return (availableWeight / totalWeight) * 100;
}

function analyzeCharacterTypes(text) {
    const types = {
        'ASCII': 0,
        '中文': 0,
        '数字': 0,
        '符号': 0,
        'Emoji': 0,
        '其他': 0
    };

    for (const char of text) {
        const code = char.codePointAt(0);
        if (code <= 127) {
            if (/\d/.test(char)) types['数字']++;
            else if (/[a-zA-Z]/.test(char)) types['ASCII']++;
            else types['符号']++;
        } else if (code >= 0x4E00 && code <= 0x9FFF) {
            types['中文']++;
        } else if (code >= 0x1F600 && code <= 0x1F64F) {
            types['Emoji']++;
        } else {
            types['其他']++;
        }
    }

    return types;
}

function countUnicodeRanges(text) {
    const ranges = new Set();
    for (const char of text) {
        const code = char.codePointAt(0);
        if (code <= 127) ranges.add('ASCII');
        else if (code <= 0x07FF) ranges.add('Latin Extended');
        else if (code <= 0xFFFF) ranges.add('BMP');
        else ranges.add('Supplementary');
    }
    return ranges.size;
}

function getEncodingMetrics(encoding) {
    const metrics = {
        'utf-8': [85, 95, 90, 100, 95],
        'utf-16': [75, 85, 85, 95, 80],
        'gbk': [80, 60, 88, 70, 85],
        'ascii': [95, 40, 95, 30, 90]
    };
    return metrics[encoding] || [50, 50, 50, 50, 50];
}

function getUnicodeName(char) {
    const names = {
        'H': 'LATIN CAPITAL LETTER H',
        'e': 'LATIN SMALL LETTER E',
        'l': 'LATIN SMALL LETTER L',
        'o': 'LATIN SMALL LETTER O',
        ' ': 'SPACE',
        '世': 'CJK UNIFIED IDEOGRAPH-4E16',
        '界': 'CJK UNIFIED IDEOGRAPH-754C',
        '🌍': 'EARTH GLOBE EUROPE-AFRICA'
    };
    return names[char] || 'UNKNOWN';
}

function encodeUTF8(char) {
    const code = char.codePointAt(0);
    if (code <= 0x7F) return [code];
    if (code <= 0x7FF) return [0xC0 | (code >> 6), 0x80 | (code & 0x3F)];
    if (code <= 0xFFFF) return [0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F)];
    return [0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F)];
}

function encodeUTF16(char) {
    const code = char.codePointAt(0);
    if (code <= 0xFFFF) return [(code >> 8) & 0xFF, code & 0xFF];
    const high = 0xD800 + ((code - 0x10000) >> 10);
    const low = 0xDC00 + ((code - 0x10000) & 0x3FF);
    return [(high >> 8) & 0xFF, high & 0xFF, (low >> 8) & 0xFF, low & 0xFF];
}

// 通知和加载函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        success: 'var(--success-gradient)',
        error: 'var(--accent-gradient)',
        warning: 'var(--warning-gradient)',
        info: 'var(--primary-gradient)'
    };
    
    if (colors[type]) {
        notification.style.background = colors[type];
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(show = true) {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            backdrop-filter: blur(5px);
        `;
        overlay.innerHTML = `
            <div style="
                background: var(--glass-bg);
                backdrop-filter: var(--glass-backdrop);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                color: white;
            ">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>正在分析...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.style.display = show ? 'flex' : 'none';
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 