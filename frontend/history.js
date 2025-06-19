// 历史记录管理器
class HistoryManager {
    constructor() {
        this.history = this.loadHistory();
        this.filteredHistory = [...this.history];
        this.init();
    }

    init() {
        this.updateStats();
        this.renderHistory();
        this.setupEventListeners();
    }

    // 从本地存储加载历史记录
    loadHistory() {
        const stored = localStorage.getItem('encodingHistory');
        if (stored) {
            try {
                return JSON.parse(stored).map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
            } catch (error) {
                console.error('Failed to parse history:', error);
                return [];
            }
        }
        
        // 如果没有历史记录，生成一些示例数据
        return this.generateSampleData();
    }

    // 保存历史记录到本地存储
    saveHistory() {
        try {
            localStorage.setItem('encodingHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    // 生成示例数据
    generateSampleData() {
        const sampleData = [
            {
                id: '1',
                type: 'convert',
                title: '文本编码转换',
                content: 'Hello World 你好世界',
                encodings: ['UTF-8', 'UTF-16', 'GBK'],
                stats: {
                    characters: 15,
                    bytes: { 'UTF-8': 21, 'UTF-16': 30, 'GBK': 19 },
                    efficiency: 85
                },
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
                favorite: false
            },
            {
                id: '2',
                type: 'analyze',
                title: '可视化分析',
                content: '编码效率分析报告',
                encodings: ['UTF-8', 'ASCII'],
                stats: {
                    characters: 8,
                    bytes: { 'UTF-8': 24, 'ASCII': 8 },
                    complexity: 2.5
                },
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
                favorite: true
            },
            {
                id: '3',
                type: 'game',
                title: '编码挑战游戏',
                content: '得分: 850 分',
                stats: {
                    score: 850,
                    level: 5,
                    time: 120,
                    accuracy: 95
                },
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
                favorite: false
            },
            {
                id: '4',
                type: 'convert',
                title: 'Unicode 字符转换',
                content: '🌍🚀💡 Emoji 编码测试',
                encodings: ['UTF-8', 'UTF-16'],
                stats: {
                    characters: 16,
                    bytes: { 'UTF-8': 28, 'UTF-16': 32 },
                    efficiency: 78
                },
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
                favorite: false
            }
        ];

        this.saveHistory();
        return sampleData;
    }

    // 添加新记录
    addRecord(record) {
        const newRecord = {
            id: Date.now().toString(),
            timestamp: new Date(),
            favorite: false,
            ...record
        };
        
        this.history.unshift(newRecord);
        
        // 限制历史记录数量
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }
        
        this.saveHistory();
        this.updateStats();
        this.renderHistory();
    }

    // 删除记录
    deleteRecord(id) {
        this.history = this.history.filter(record => record.id !== id);
        this.saveHistory();
        this.updateStats();
        this.renderHistory();
    }

    // 切换收藏状态
    toggleFavorite(id) {
        const record = this.history.find(r => r.id === id);
        if (record) {
            record.favorite = !record.favorite;
            this.saveHistory();
            this.renderHistory();
        }
    }

    // 清空所有历史记录
    clearAll() {
        if (confirm('确定要清空所有历史记录吗？此操作无法撤销。')) {
            this.history = [];
            this.filteredHistory = [];
            this.saveHistory();
            this.updateStats();
            this.renderHistory();
            this.showNotification('历史记录已清空', 'success');
        }
    }

    // 更新统计信息
    updateStats() {
        const stats = {
            totalConversions: 0,
            totalAnalyses: 0,
            totalGames: 0,
            totalCharacters: 0
        };

        this.history.forEach(record => {
            switch (record.type) {
                case 'convert':
                    stats.totalConversions++;
                    stats.totalCharacters += record.stats?.characters || 0;
                    break;
                case 'analyze':
                    stats.totalAnalyses++;
                    stats.totalCharacters += record.stats?.characters || 0;
                    break;
                case 'game':
                    stats.totalGames++;
                    break;
            }
        });

        // 更新DOM
        document.getElementById('totalConversions').textContent = stats.totalConversions;
        document.getElementById('totalAnalyses').textContent = stats.totalAnalyses;
        document.getElementById('totalGames').textContent = stats.totalGames;
        document.getElementById('totalCharacters').textContent = stats.totalCharacters.toLocaleString();
    }

    // 筛选历史记录
    filterHistory() {
        const typeFilter = document.getElementById('typeFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        this.filteredHistory = this.history.filter(record => {
            // 类型筛选
            if (typeFilter !== 'all' && record.type !== typeFilter) {
                return false;
            }

            // 日期筛选
            if (dateFilter !== 'all') {
                const now = new Date();
                const recordDate = record.timestamp;
                
                switch (dateFilter) {
                    case 'today':
                        if (recordDate.toDateString() !== now.toDateString()) {
                            return false;
                        }
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (recordDate < weekAgo) {
                            return false;
                        }
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (recordDate < monthAgo) {
                            return false;
                        }
                        break;
                }
            }

            // 搜索筛选
            if (searchFilter && !record.content.toLowerCase().includes(searchFilter)) {
                return false;
            }

            return true;
        });

        this.renderHistory();
    }

    // 渲染历史记录列表
    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.filteredHistory.length === 0) {
            historyList.innerHTML = this.renderEmptyState();
            return;
        }

        const html = this.filteredHistory.map(record => this.renderHistoryItem(record)).join('');
        historyList.innerHTML = html;

        // 添加动画
        historyList.querySelectorAll('.history-item').forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in');
        });
    }

    // 渲染单个历史记录项
    renderHistoryItem(record) {
        const typeConfig = {
            convert: { icon: 'exchange-alt', label: '文本转换', class: 'type-convert' },
            analyze: { icon: 'chart-bar', label: '可视化分析', class: 'type-analyze' },
            game: { icon: 'gamepad', label: '游戏记录', class: 'type-game' }
        };

        const config = typeConfig[record.type] || typeConfig.convert;
        const timeStr = this.formatTime(record.timestamp);
        const stats = this.renderStats(record);

        return `
            <div class="history-item" data-id="${record.id}">
                <div class="item-header">
                    <div class="item-meta">
                        <span class="item-type ${config.class}">
                            <i class="fas fa-${config.icon}"></i> ${config.label}
                        </span>
                        <span class="item-time">
                            <i class="far fa-clock"></i> ${timeStr}
                        </span>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="historyManager.toggleFavorite('${record.id}')" title="收藏">
                            <i class="fa${record.favorite ? 's' : 'r'} fa-star"></i>
                        </button>
                        <button class="action-btn" onclick="historyManager.viewDetails('${record.id}')" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="historyManager.deleteRecord('${record.id}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="item-content">
                    <div class="content-preview">
                        ${this.escapeHtml(record.content)}
                    </div>
                    <div class="item-stats">
                        ${stats}
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染统计信息
    renderStats(record) {
        const stats = [];
        
        switch (record.type) {
            case 'convert':
            case 'analyze':
                if (record.stats?.characters) {
                    stats.push(`<span class="stat-item"><i class="fas fa-font"></i> ${record.stats.characters} 字符</span>`);
                }
                if (record.encodings?.length) {
                    stats.push(`<span class="stat-item"><i class="fas fa-code"></i> ${record.encodings.join(', ')}</span>`);
                }
                if (record.stats?.efficiency) {
                    stats.push(`<span class="stat-item"><i class="fas fa-tachometer-alt"></i> ${record.stats.efficiency}% 效率</span>`);
                }
                break;
            
            case 'game':
                if (record.stats?.score) {
                    stats.push(`<span class="stat-item"><i class="fas fa-trophy"></i> ${record.stats.score} 分</span>`);
                }
                if (record.stats?.level) {
                    stats.push(`<span class="stat-item"><i class="fas fa-layer-group"></i> 第 ${record.stats.level} 关</span>`);
                }
                if (record.stats?.accuracy) {
                    stats.push(`<span class="stat-item"><i class="fas fa-bullseye"></i> ${record.stats.accuracy}% 准确率</span>`);
                }
                break;
        }

        return stats.join('');
    }

    // 渲染空状态
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-title">暂无历史记录</h3>
                <p class="empty-desc">开始使用编码转换器来创建您的第一条记录吧！</p>
                <button class="btn" onclick="window.location.href='converter.html'">
                    <i class="fas fa-plus"></i> 开始转换
                </button>
            </div>
        `;
    }

    // 查看详情
    viewDetails(id) {
        const record = this.history.find(r => r.id === id);
        if (!record) return;

        const modal = this.createModal(record);
        document.body.appendChild(modal);
        
        // 添加动画
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    // 创建详情模态框
    createModal(record) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${record.title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4>内容</h4>
                        <div class="detail-content">${this.escapeHtml(record.content)}</div>
                    </div>
                    ${this.renderDetailStats(record)}
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="this.closest('.modal-overlay').remove()">
                        关闭
                    </button>
                </div>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .modal-overlay.show { opacity: 1; }
                .modal-content {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--glass-shadow);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                }
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                .modal-body { padding: 1.5rem; }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid var(--glass-border);
                    text-align: right;
                }
                .detail-section {
                    margin-bottom: 1.5rem;
                }
                .detail-section h4 {
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .detail-content {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 1rem;
                    font-family: monospace;
                    color: var(--text-secondary);
                }
            `;
            document.head.appendChild(style);
        }

        return modal;
    }

    // 渲染详细统计信息
    renderDetailStats(record) {
        if (record.type === 'game') {
            return `
                <div class="detail-section">
                    <h4>游戏统计</h4>
                    <div class="stats-grid">
                        <div>得分: ${record.stats?.score || 0}</div>
                        <div>关卡: ${record.stats?.level || 0}</div>
                        <div>用时: ${record.stats?.time || 0}秒</div>
                        <div>准确率: ${record.stats?.accuracy || 0}%</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="detail-section">
                <h4>编码统计</h4>
                <div class="stats-grid">
                    <div>字符数: ${record.stats?.characters || 0}</div>
                    <div>编码格式: ${record.encodings?.join(', ') || 'N/A'}</div>
                    ${record.stats?.bytes ? Object.entries(record.stats.bytes)
                        .map(([enc, bytes]) => `<div>${enc}: ${bytes} 字节</div>`)
                        .join('') : ''}
                </div>
            </div>
        `;
    }

    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60 * 1000) {
            return '刚刚';
        } else if (diff < 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 1000))} 分钟前`;
        } else if (diff < 24 * 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return `${Math.floor(diff / (24 * 60 * 60 * 1000))} 天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 搜索框实时筛选
        document.getElementById('searchFilter').addEventListener('input', () => {
            this.filterHistory();
        });

        // 筛选器变化
        document.getElementById('typeFilter').addEventListener('change', () => {
            this.filterHistory();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.filterHistory();
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
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
}

// 全局函数
function filterHistory() {
    historyManager.filterHistory();
}

function clearHistory() {
    historyManager.clearAll();
}

// 初始化历史管理器
let historyManager;

document.addEventListener('DOMContentLoaded', () => {
    historyManager = new HistoryManager();
});

// 添加通知动画样式
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