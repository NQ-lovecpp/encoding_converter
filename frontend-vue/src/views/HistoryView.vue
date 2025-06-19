<template>
  <div class="page-container">
    <div class="history-page">
      <header class="page-header">
        <h1>📚 历史记录</h1>
        <p>查看您的转换历史和分析记录</p>
      </header>
      
      <div class="history-container">
        <div class="controls-section">
          <div class="filter-controls">
            <div class="filter-group">
              <label>类型筛选</label>
              <select v-model="filterType">
                <option value="all">全部</option>
                <option value="convert">文本转换</option>
                <option value="analyze">可视化分析</option>
                <option value="game">游戏记录</option>
              </select>
            </div>
            <div class="filter-group">
              <label>日期筛选</label>
              <select v-model="filterDate">
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
            </div>
            <div class="filter-group">
              <label>搜索内容</label>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="搜索文本内容..."
              >
            </div>
            <div class="action-buttons">
              <button class="btn filter-btn" @click="applyFilters">
                <i class="fas fa-filter"></i> 筛选
              </button>
              <button class="btn clear-btn" @click="clearHistory">
                <i class="fas fa-trash"></i> 清空
              </button>
            </div>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon convert">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="stat-value">{{ stats.totalConversions }}</div>
            <div class="stat-label">总转换次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon analyze">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-value">{{ stats.totalAnalyses }}</div>
            <div class="stat-label">分析次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon game">
              <i class="fas fa-gamepad"></i>
            </div>
            <div class="stat-value">{{ stats.totalGames }}</div>
            <div class="stat-label">游戏记录</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon chars">
              <i class="fas fa-font"></i>
            </div>
            <div class="stat-value">{{ stats.totalCharacters }}</div>
            <div class="stat-label">处理字符数</div>
          </div>
        </div>
        
        <div class="history-list">
          <div 
            v-for="item in filteredHistory" 
            :key="item.id"
            class="history-item"
            @click="viewHistoryItem(item)"
          >
            <div class="item-header">
              <div class="item-meta">
                <span :class="`item-type type-${item.type}`">
                  {{ getTypeLabel(item.type) }}
                </span>
                <span class="item-time">{{ formatDate(item.timestamp) }}</span>
              </div>
              <div class="item-actions">
                <button class="action-btn" @click.stop="copyItem(item)">
                  <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn" @click.stop="deleteItem(item.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="item-content">
              <div class="content-preview">
                {{ item.content.substring(0, 100) }}...
              </div>
              <div class="item-stats">
                <span><i class="fas fa-font"></i> {{ item.charCount }} 字符</span>
                <span><i class="fas fa-database"></i> {{ item.byteCount }} 字节</span>
                <span><i class="fas fa-clock"></i> {{ item.duration }}ms</span>
              </div>
            </div>
          </div>
          
          <div v-if="filteredHistory.length === 0" class="empty-state">
            <i class="fas fa-history empty-icon"></i>
            <h3>暂无历史记录</h3>
            <p>开始使用转换器创建您的第一条记录吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface HistoryItem {
  id: string
  type: 'convert' | 'analyze' | 'game'
  content: string
  timestamp: number
  charCount: number
  byteCount: number
  duration: number
}

const filterType = ref('all')
const filterDate = ref('all')
const searchQuery = ref('')

const stats = reactive({
  totalConversions: 25,
  totalAnalyses: 8,
  totalGames: 12,
  totalCharacters: 1520
})

// 模拟历史记录数据
const historyData = ref<HistoryItem[]>([
  {
    id: '1',
    type: 'convert',
    content: 'Hello World 你好世界',
    timestamp: Date.now() - 1000 * 60 * 30,
    charCount: 16,
    byteCount: 22,
    duration: 5
  },
  {
    id: '2',
    type: 'analyze',
    content: 'Unicode字符分析',
    timestamp: Date.now() - 1000 * 60 * 60,
    charCount: 8,
    byteCount: 14,
    duration: 12
  },
  {
    id: '3',
    type: 'game',
    content: '编码挑战游戏记录',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    charCount: 0,
    byteCount: 0,
    duration: 45000
  }
])

const filteredHistory = computed(() => {
  let filtered = historyData.value
  
  if (filterType.value !== 'all') {
    filtered = filtered.filter(item => item.type === filterType.value)
  }
  
  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return filtered
})

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    convert: '文本转换',
    analyze: '可视化分析',
    game: '游戏记录'
  }
  return labels[type] || type
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 1000 * 60) {
    return '刚刚'
  } else if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))}分钟前`
  } else if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

function applyFilters() {
  // 筛选逻辑已通过computed属性实现
}

function clearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    historyData.value = []
  }
}

function viewHistoryItem(item: HistoryItem) {
  console.log('查看历史记录:', item)
}

function copyItem(item: HistoryItem) {
  navigator.clipboard.writeText(item.content)
}

function deleteItem(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    historyData.value = historyData.value.filter(item => item.id !== id)
  }
}
</script>

<style scoped>
.history-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
}

.controls-section {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

.filter-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.clear-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn:hover {
  transform: scale(1.05);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.convert {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.analyze {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.game {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.chars {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.history-list {
  background: var(--card-bg);
  border-radius: 1rem;
  overflow: hidden;
}

.history-item {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.history-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-type {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-convert {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.type-analyze {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.type-game {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.item-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: var(--input-bg);
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.item-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.content-preview {
  background: var(--input-bg);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.item-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .filter-controls {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-column: 1;
  }
  
  .item-content {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 