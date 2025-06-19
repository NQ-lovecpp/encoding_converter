<template>
  <div class="page-container">
    <div class="visualizer-page">
      <header class="page-header">
        <h1>📊 编码可视化分析</h1>
        <p>深入理解字符编码的内部结构和效率</p>
      </header>
      
      <div class="analysis-container">
        <div class="input-section">
          <div class="input-controls">
            <div class="input-group">
              <label>分析文本</label>
              <input 
                v-model="analysisText"
                type="text" 
                placeholder="输入要分析的文本..."
                @input="analyzeText"
              >
            </div>
            <div class="input-group">
              <label>编码格式</label>
              <select v-model="selectedEncoding" @change="analyzeText">
                <option value="all">所有编码</option>
                <option value="utf-8">UTF-8</option>
                <option value="utf-16">UTF-16</option>
                <option value="gbk">GBK</option>
                <option value="ascii">ASCII</option>
              </select>
            </div>
            <button class="analyze-btn" @click="analyzeText">
              <i class="fas fa-chart-bar"></i> 开始分析
            </button>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="stat-value">{{ statistics.totalBytes }}</div>
            <div class="stat-label">总字节数</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-tachometer-alt"></i>
            </div>
            <div class="stat-value">{{ statistics.efficiency }}%</div>
            <div class="stat-label">编码效率</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="stat-value">{{ statistics.complexity }}</div>
            <div class="stat-label">复杂度指数</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-value">{{ statistics.compatibility }}%</div>
            <div class="stat-label">兼容性评分</div>
          </div>
        </div>
        
        <div class="charts-section">
          <div class="chart-card">
            <h3>字节分布图</h3>
            <div class="chart-placeholder">
              <i class="fas fa-chart-pie"></i>
              <p>图表将在这里显示</p>
            </div>
          </div>
          <div class="chart-card">
            <h3>编码效率对比</h3>
            <div class="chart-placeholder">
              <i class="fas fa-chart-bar"></i>
              <p>图表将在这里显示</p>
            </div>
          </div>
        </div>
        
        <div class="encoding-table">
          <h3>详细编码数据</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>字符</th>
                  <th>Unicode</th>
                  <th>UTF-8</th>
                  <th>UTF-16</th>
                  <th>字节数</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(char, index) in analysisResults" :key="index">
                  <td class="char-cell">{{ char.char }}</td>
                  <td class="unicode-cell">{{ char.unicode }}</td>
                  <td class="encoding-cell">{{ char.utf8 }}</td>
                  <td class="encoding-cell">{{ char.utf16 }}</td>
                  <td class="bytes-cell">{{ char.bytes }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface AnalysisResult {
  char: string
  unicode: string
  utf8: string
  utf16: string
  bytes: number
}

const analysisText = ref('')
const selectedEncoding = ref('UTF-8')

const statistics = reactive({
  totalBytes: 0,
  efficiency: 0,
  complexity: 0,
  compatibility: 0
})

const analysisResults = ref<AnalysisResult[]>([])

function analyzeText() {
  if (!analysisText.value) return
  
  const results: AnalysisResult[] = []
  let totalBytes = 0
  
  for (let i = 0; i < analysisText.value.length; i++) {
    const char = analysisText.value[i]
    const codePoint = char.codePointAt(0)
    
    if (codePoint !== undefined) {
      const utf8Bytes = new TextEncoder().encode(char).length
      const utf16Bytes = char.length * 2
      
      results.push({
        char,
        unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        utf8: `${utf8Bytes} bytes`,
        utf16: `${utf16Bytes} bytes`,
        bytes: utf8Bytes
      })
      
      totalBytes += utf8Bytes
    }
  }
  
  analysisResults.value = results
  statistics.totalBytes = totalBytes
  statistics.efficiency = Math.round((analysisText.value.length / totalBytes) * 100)
  statistics.complexity = Math.round((results.length / analysisText.value.length) * 100)
  statistics.compatibility = Math.round(Math.random() * 20 + 80) // 模拟兼容性评分
}

// 初始分析
analyzeText()
</script>

<style scoped>
.visualizer-page {
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

.analysis-container {
  max-width: 1200px;
  margin: 0 auto;
}

.input-section {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.input-controls {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text-primary);
}

.analyze-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
  white-space: nowrap;
}

.analyze-btn:hover {
  transform: scale(1.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
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

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 2rem;
}

.chart-card h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text-primary);
}

.chart-placeholder {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 2px dashed var(--border);
  border-radius: 0.5rem;
}

.chart-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.encoding-table {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 2rem;
}

.encoding-table h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text-primary);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background: var(--input-bg);
  font-weight: 600;
  color: var(--text-primary);
}

.char-cell {
  font-size: 1.2rem;
  font-weight: 600;
}

.unicode-cell {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #4facfe;
}

.encoding-cell {
  font-family: 'Monaco', 'Consolas', monospace;
  background: var(--input-bg);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
}

.bytes-cell {
  font-weight: 600;
  text-align: center;
}

@media (max-width: 768px) {
  .input-controls {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 