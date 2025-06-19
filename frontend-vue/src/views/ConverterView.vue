<template>
  <div class="converter-page">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i class="fas" :class="sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>

      <!-- 编码设置卡片 -->
      <div class="sidebar-card">
        <div class="card-header">
          <h3><i class="fas fa-cog"></i> 编码设置</h3>
        </div>
        <div class="card-content">
          <div class="encoding-selector">
            <label>选择编码格式：</label>
            <div class="encoding-grid">
              <label v-for="encoding in availableEncodings" :key="encoding.name" class="encoding-option">
                <input
                  type="checkbox"
                  :value="encoding.name"
                  v-model="selectedEncodings"
                  @change="updateDownloadButton"
                />
                <span class="checkmark">
                  <i class="fas fa-check"></i>
                </span>
                <div class="encoding-info">
                  <span class="encoding-name">{{ encoding.display_name || encoding.name }}</span>
                  <span class="encoding-desc">{{ encoding.description || '' }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计信息卡片 -->
      <div class="sidebar-card">
        <div class="card-header">
          <h3><i class="fas fa-chart-bar"></i> 统计信息</h3>
        </div>
        <div class="card-content">
          <div class="stats-container">
            <div class="stat-item">
              <span class="stat-label">字符数</span>
              <span class="stat-value">{{ stats.charCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">字节数</span>
              <span class="stat-value">{{ stats.byteCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">唯一字符</span>
              <span class="stat-value">{{ stats.uniqueChars }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">行数</span>
              <span class="stat-value">{{ stats.lineCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件操作卡片 -->
      <div class="sidebar-card">
        <div class="card-header">
          <h3><i class="fas fa-file-upload"></i> 文件操作</h3>
        </div>
        <div class="card-content">
          <div class="file-upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent>
            <input ref="fileInput" type="file" accept=".txt,.csv,.json,.xml,.html" @change="handleFileUpload" hidden />
            <div class="upload-content">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>拖拽文件或点击上传</p>
              <small>支持 TXT, CSV, JSON, XML, HTML</small>
            </div>
          </div>
          <div class="file-actions">
            <button class="btn btn-outline" @click="detectEncoding" :disabled="!inputText">
              <i class="fas fa-search"></i> 检测编码
            </button>
            <button class="btn btn-primary" @click="downloadResults" :disabled="!hasResults">
              <i class="fas fa-download"></i> 下载转换
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主工作区 -->
    <div class="workspace">
      <!-- 输入区域 -->
      <section class="main-card input-card">
        <div class="card-header">
          <h2><i class="fas fa-keyboard"></i> 文本输入</h2>
          <div class="section-actions">
            <button class="btn btn-sm" @click="clearText">
              <i class="fas fa-trash"></i> 清空
            </button>
            <button class="btn btn-sm" @click="pasteText">
              <i class="fas fa-paste"></i> 粘贴
            </button>
          </div>
        </div>
        <div class="card-content">
          <div class="input-container">
            <textarea
              v-model="inputText"
              @input="handleTextInput"
              placeholder="请输入要转换的文本，或上传文件..."
              rows="6"
              :maxlength="maxTextLength"
            ></textarea>
            <div class="input-footer">
              <span class="char-counter">{{ inputText.length }} / {{ maxTextLength }} 字符</span>
              <div class="encoding-info">
                <i class="fas fa-info-circle"></i>
                <span>UTF-8</span>
              </div>
            </div>
          </div>
          <div class="convert-section">
            <button class="convert-btn" @click="convertText" :disabled="!canConvert || isLoading">
              <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
              {{ isLoading ? '转换中...' : '开始转换' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 结果展示区域 -->
      <section class="main-card results-card">
        <div class="card-header">
          <h2><i class="fas fa-magic"></i> 转换结果</h2>
          <div class="view-options">
            <button
              class="view-btn"
              :class="{ active: activeView === 'characters' }"
              @click="switchView('characters')"
            >
              <i class="fas fa-th"></i> 字符视图
            </button>
            <button
              class="view-btn"
              :class="{ active: activeView === 'table' }"
              @click="switchView('table')"
            >
              <i class="fas fa-table"></i> 表格视图
            </button>
            <button
              class="view-btn"
              :class="{ active: activeView === 'raw' }"
              @click="switchView('raw')"
            >
              <i class="fas fa-code"></i> 原始数据
            </button>
          </div>
        </div>
        <div class="card-content">
          <!-- 字符视图 -->
          <div v-show="activeView === 'characters'" class="view-container">
            <div v-if="!hasResults" class="no-results">
              <i class="fas fa-info-circle"></i>
              <p>请输入文本并点击转换按钮</p>
            </div>
            <div v-else class="characters-grid">
              <div v-for="(char, index) in conversionResults?.characters" :key="index" class="character-card">
                <div class="char-display">{{ char.char }}</div>
                <div class="char-info">
                  <div class="unicode-info">{{ char.unicode }}</div>
                  <div class="unicode-name">{{ char.unicode_name }}</div>
                </div>
                <div class="encodings-list">
                  <div v-for="(encoding, name) in char.encodings" :key="name" class="encoding-result">
                    <span class="encoding-label">{{ name.toUpperCase() }}</span>
                    <span v-if="encoding.success" class="encoding-value">{{ encoding.hex }}</span>
                    <span v-else class="encoding-error">{{ encoding.error }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 表格视图 -->
          <div v-show="activeView === 'table'" class="view-container">
            <div v-if="!hasResults" class="no-results">
              <i class="fas fa-info-circle"></i>
              <p>请输入文本并点击转换按钮</p>
            </div>
            <div v-else class="table-container">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>字符</th>
                    <th>Unicode</th>
                    <th>名称</th>
                    <th v-for="encoding in selectedEncodings" :key="encoding">{{ encoding.toUpperCase() }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(char, index) in conversionResults?.characters" :key="index">
                    <td class="char-cell">{{ char.char }}</td>
                    <td>{{ char.unicode }}</td>
                    <td class="name-cell">{{ char.unicode_name }}</td>
                    <td v-for="encoding in selectedEncodings" :key="encoding" class="encoding-cell">
                      <span v-if="char.encodings[encoding]?.success" class="success">
                        {{ char.encodings[encoding].hex }}
                      </span>
                      <span v-else class="error">
                        {{ char.encodings[encoding]?.error || 'N/A' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 原始数据视图 -->
          <div v-show="activeView === 'raw'" class="view-container">
            <div v-if="!hasResults" class="no-results">
              <i class="fas fa-info-circle"></i>
              <p>请输入文本并点击转换按钮</p>
            </div>
            <div v-else class="raw-data-container">
              <div class="encoding-tabs">
                <button
                  v-for="encoding in selectedEncodings"
                  :key="encoding"
                  class="encoding-tab"
                  :class="{ active: activeRawTab === encoding }"
                  @click="activeRawTab = encoding"
                >
                  {{ encoding.toUpperCase() }}
                </button>
              </div>
              <div class="raw-content">
                <div v-if="conversionResults?.overall[activeRawTab]" class="raw-data">
                  <div class="data-section">
                    <h4>十六进制表示</h4>
                    <div class="hex-data">{{ conversionResults.overall[activeRawTab].hex }}</div>
                  </div>
                  <div class="data-section">
                    <h4>Base64 编码</h4>
                    <div class="base64-data">{{ conversionResults.overall[activeRawTab].base64 }}</div>
                  </div>
                  <div class="data-section">
                    <h4>字节数组</h4>
                    <div class="bytes-data">{{ conversionResults.overall[activeRawTab].bytes?.join(', ') }}</div>
                  </div>
                  <div class="data-section">
                    <h4>统计信息</h4>
                    <div class="stats-data">
                      <p>字节长度: {{ conversionResults.overall[activeRawTab].length }}</p>
                      <p>大小: {{ conversionResults.overall[activeRawTab].size_mb }} MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button class="tool-btn" @click="copyResults" title="复制结果" :disabled="!hasResults">
          <i class="fas fa-copy"></i>
        </button>
        <button class="tool-btn" @click="shareResults" title="分享" :disabled="!hasResults">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
    </div>

    <!-- 加载指示器 -->
    <div v-show="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>处理中...</p>
      </div>
    </div>

    <!-- 通知系统 -->
    <NotificationSystem ref="notificationSystem" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NotificationSystem from '../components/NotificationSystem.vue'

// 类型定义
interface EncodingOption {
  name: string
  display_name?: string
  description?: string
}

interface EncodingResult {
  success: boolean
  hex?: string
  bytes?: number[]
  base64?: string
  length?: number
  error?: string
}

interface CharacterResult {
  char: string
  unicode: string
  unicode_name: string
  position: number
  encodings: Record<string, EncodingResult>
}

interface ConversionResults {
  characters: CharacterResult[]
  overall: Record<string, EncodingResult & { size_mb?: number }>
  stats: {
    length: number
    byte_count_utf8: number
    unique_chars: number
    line_count: number
  }
}

// 状态管理
const sidebarCollapsed = ref(false)
const inputText = ref('')
const selectedEncodings = ref<string[]>(['utf-8', 'utf-16', 'gbk', 'ascii'])
const availableEncodings = ref<EncodingOption[]>([])
const conversionResults = ref<ConversionResults | null>(null)
const isLoading = ref(false)
const activeView = ref('characters')
const activeRawTab = ref('utf-8')
const fileInput = ref<HTMLInputElement>()

// 配置
const maxTextLength = 10000
const apiBaseUrl = 'http://localhost:5000/api'

// 计算属性
const canConvert = computed(() => {
  return inputText.value.length > 0 && selectedEncodings.value.length > 0
})

const hasResults = computed(() => {
  return conversionResults.value !== null
})

const stats = computed(() => {
  if (!conversionResults.value) {
    return {
      charCount: inputText.value.length,
      byteCount: new TextEncoder().encode(inputText.value).length,
      uniqueChars: new Set(inputText.value).size,
      lineCount: inputText.value.split('\n').length
    }
  }
  return {
    charCount: conversionResults.value.stats.length,
    byteCount: conversionResults.value.stats.byte_count_utf8,
    uniqueChars: conversionResults.value.stats.unique_chars,
    lineCount: conversionResults.value.stats.line_count
  }
})

// 通知系统引用
const notificationSystem = ref<InstanceType<typeof NotificationSystem>>()

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleTextInput = () => {
  // 限制文本长度
  if (inputText.value.length > maxTextLength) {
    inputText.value = inputText.value.substring(0, maxTextLength)
    showNotification(`文本过长，已截取到 ${maxTextLength} 字符`, 'warning')
  }
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${apiBaseUrl}/upload`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    if (data.success) {
      inputText.value = data.text
      showNotification('文件上传成功！', 'success')
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    showNotification('文件上传失败: ' + (error as Error).message, 'error')
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files?.[0]) {
    const fakeEvent = { target: { files } } as any
    handleFileUpload(fakeEvent)
  }
}

const convertText = async () => {
  if (!canConvert.value) return

  isLoading.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: inputText.value,
        encodings: selectedEncodings.value
      })
    })

    const data = await response.json()
    if (data.success) {
      conversionResults.value = data.results
      activeRawTab.value = selectedEncodings.value[0] || 'utf-8'
      showNotification('转换完成！', 'success')
      
      // 保存到历史记录
      saveToHistory({
        text: inputText.value,
        results: data.results,
        timestamp: Date.now(),
        encodings: selectedEncodings.value
      })
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    console.error('转换失败:', error)
    showNotification('转换失败: ' + (error as Error).message, 'error')
  } finally {
    isLoading.value = false
  }
}

const detectEncoding = async () => {
  if (!inputText.value) return

  try {
    const response = await fetch(`${apiBaseUrl}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: inputText.value
      })
    })

    const data = await response.json()
    if (data.success) {
      showNotification(
        `检测到编码: ${data.detected_encoding} (置信度: ${Math.round(data.confidence * 100)}%)`,
        'info'
      )
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    console.error('编码检测失败:', error)
    showNotification('编码检测失败: ' + (error as Error).message, 'error')
  }
}

const clearText = () => {
  inputText.value = ''
  conversionResults.value = null
}

const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
  } catch (error) {
    showNotification('无法访问剪贴板', 'error')
  }
}

const switchView = (view: string) => {
  activeView.value = view
}

const updateDownloadButton = () => {
  // 这个方法在原版中用于更新下载按钮状态，这里已经通过 computed 属性实现
}

const copyResults = async () => {
  if (!hasResults.value) return

  try {
    const text = formatResultsForCopy()
    await navigator.clipboard.writeText(text)
    showNotification('结果已复制到剪贴板', 'success')
  } catch (error) {
    showNotification('复制失败', 'error')
  }
}

const shareResults = () => {
  if (!hasResults.value) return

  if (navigator.share) {
    navigator.share({
      title: '字符编码转换结果',
      text: formatResultsForCopy()
    })
  } else {
    copyResults()
  }
}

const downloadResults = () => {
  if (!hasResults.value) return

  const data = formatResultsForDownload()
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `encoding_results_${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const formatResultsForCopy = (): string => {
  if (!conversionResults.value) return ''

  let result = `字符编码转换结果\n`
  result += `原始文本: ${inputText.value}\n`
  result += `转换时间: ${new Date().toLocaleString()}\n\n`

  conversionResults.value.characters.forEach(char => {
    result += `字符: ${char.char} (${char.unicode})\n`
    Object.entries(char.encodings).forEach(([encoding, data]) => {
      if (data.success) {
        result += `  ${encoding.toUpperCase()}: ${data.hex}\n`
      }
    })
    result += '\n'
  })

  return result
}

const formatResultsForDownload = (): string => {
  return formatResultsForCopy()
}

const saveToHistory = (record: any) => {
  try {
    const history = JSON.parse(localStorage.getItem('encoding-history') || '[]')
    history.unshift(record)
    history.splice(100) // 只保留最近100条记录
    localStorage.setItem('encoding-history', JSON.stringify(history))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  if (notificationSystem.value) {
    notificationSystem.value.addNotification(message, type)
  } else {
    // 后备方案
    console.log(`[${type.toUpperCase()}] ${message}`)
  }
}

// 加载可用编码
const loadEncodings = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/encodings`)
    const data = await response.json()
    
    if (data.success && data.encodings) {
      availableEncodings.value = data.encodings
    } else {
      throw new Error(data.error || '获取编码列表失败')
    }
  } catch (error) {
    console.error('加载编码失败:', error)
    // 使用默认编码作为后备
    availableEncodings.value = [
      { name: 'utf-8', display_name: 'UTF-8', description: 'Unicode (UTF-8) - 可变长度编码' },
      { name: 'utf-16', display_name: 'UTF-16', description: 'Unicode (UTF-16) - 16位编码' },
      { name: 'gbk', display_name: 'GBK', description: 'GBK - 中文字符编码' },
      { name: 'ascii', display_name: 'ASCII', description: 'ASCII - 7位字符编码' }
    ]
    showNotification('使用默认编码列表', 'warning')
  }
}

// 初始化
onMounted(() => {
  loadEncodings()
})
</script>

<style scoped>
.converter-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-gradient);
  color: white;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 24px;
  gap: 24px;
}

/* 侧边栏样式 - 卡片化 */
.sidebar {
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-toggle {
  position: absolute;
  top: 24px;
  right: -16px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.sidebar-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 卡片样式 */
.sidebar-card,
.main-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar-card:hover,
.main-card:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.sidebar.collapsed .sidebar-card {
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
}

/* 卡片头部 */
.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2,
.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.5px;
}

.card-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
}

.card-header h2 i,
.card-header h3 i {
  width: 20px;
  text-align: center;
  color: #667eea;
}

/* 卡片内容 */
.card-content {
  padding: 24px;
}

/* 编码选择器优化 */
.encoding-selector {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.encoding-selector label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
  display: block;
  font-weight: 500;
}

.encoding-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.encoding-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.02);
  min-height: 60px;
}

.encoding-option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
}

.encoding-option input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  margin-top: 2px;
}

.checkmark i {
  font-size: 10px;
  color: transparent;
  transition: all 0.3s ease;
  font-weight: 900;
}

.encoding-option input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transform: scale(1.05);
}

.encoding-option input[type="checkbox"]:checked + .checkmark i {
  color: white;
  transform: scale(1.1);
}

.encoding-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.encoding-name {
  font-weight: 600;
  display: block;
  color: white;
  font-size: 0.9rem;
  line-height: 1.3;
  word-break: break-word;
}

.encoding-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* 统计信息样式 */
.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  padding: 16px 12px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 126, 234, 0.3);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #667eea;
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

/* 文件上传区域 */
.file-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.file-upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.upload-content i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #667eea;
  opacity: 0.8;
}

.upload-content p {
  margin: 8px 0 4px;
  font-weight: 600;
  color: white;
}

.upload-content small {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.file-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 按钮样式 */
.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.6s ease;
  transform: translate(-50%, -50%);
}

.btn:hover::before {
  width: 200px;
  height: 200px;
}

.btn-outline {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
  transform: none !important;
  box-shadow: none !important;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 0.8rem;
}

/* 工作区样式 */
.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* 主卡片样式 */
.main-card {
  flex: none;
}

.input-card {
  min-height: 280px;
}

.results-card {
  flex: 1;
  min-height: 400px;
}

/* 节目标题操作 */
.section-actions {
  display: flex;
  gap: 10px;
}

/* 输入容器 */
.input-container {
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.input-container:focus-within {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-container textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  min-height: 120px;
}

.input-container textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.char-counter {
  font-family: 'SF Mono', monospace;
}

.encoding-info {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  color: #667eea;
  font-weight: 500;
}

/* 转换按钮 */
.convert-section {
  display: flex;
  justify-content: center;
}

.convert-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.convert-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.convert-btn:hover:not(:disabled)::before {
  left: 100%;
}

.convert-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.convert-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.convert-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 视图选项 */
.view-options {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.view-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.view-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
}

.view-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

/* 视图容器 */
.view-container {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  min-height: 320px;
  backdrop-filter: blur(10px);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  color: rgba(255, 255, 255, 0.5);
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-results p {
  font-size: 1.1rem;
  font-weight: 500;
}

/* 字符网格 */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.character-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.character-card:hover {
  transform: translateY(-4px);
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.char-display {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.char-info {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.unicode-info {
  font-family: 'SF Mono', monospace;
  color: #4facfe;
  font-weight: 600;
  font-size: 1rem;
}

.unicode-name {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  font-style: italic;
}

.encodings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.encoding-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'SF Mono', monospace;
  font-size: 0.85rem;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.encoding-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.encoding-value {
  color: #43e97b;
  font-weight: 600;
}

.encoding-error {
  color: #f5576c;
  font-weight: 500;
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.results-table th,
.results-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.results-table th {
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
  position: sticky;
  top: 0;
}

.results-table tbody tr {
  transition: background 0.2s ease;
}

.results-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.04);
}

.char-cell {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  color: white;
}

.name-cell {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encoding-cell {
  font-family: 'SF Mono', monospace;
  font-size: 0.8rem;
}

.encoding-cell .success {
  color: #43e97b;
  font-weight: 600;
}

.encoding-cell .error {
  color: #f5576c;
  font-weight: 500;
}

/* 原始数据视图 */
.encoding-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 12px;
}

.encoding-tab {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
}

.encoding-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.encoding-tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.raw-data {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-section h4 {
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-section h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
}

.hex-data,
.base64-data,
.bytes-data {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  font-family: 'SF Mono', monospace;
  font-size: 0.85rem;
  word-break: break-all;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.stats-data {
  background: rgba(255, 255, 255, 0.04);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stats-data p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: space-between;
  font-weight: 500;
}

/* 工具栏 */
.toolbar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.tool-group {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  padding: 8px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.tool-btn {
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
  color: #667eea;
}

.tool-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 加载覆盖层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-spinner i {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: #667eea;
}

.loading-spinner p {
  font-weight: 600;
  color: white;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .converter-page {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    gap: 16px;
  }

  .sidebar-card {
    min-width: 320px;
    flex-shrink: 0;
  }

  .sidebar.collapsed {
    width: 100%;
  }

  .workspace {
    gap: 16px;
  }

  .encoding-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .encoding-option {
    min-height: auto;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .converter-page {
    padding: 12px;
  }

  .sidebar {
    flex-direction: column;
    gap: 12px;
  }

  .sidebar-card {
    min-width: auto;
  }

  .card-content {
    padding: 16px;
  }

  .card-header {
    padding: 16px 16px 12px;
  }

  .encoding-grid {
    grid-template-columns: 1fr;
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .file-actions {
    grid-template-columns: 1fr;
  }

  .section-actions {
    flex-direction: column;
    gap: 8px;
  }

  .view-options {
    flex-wrap: wrap;
  }

  .toolbar {
    bottom: 16px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .convert-btn {
    padding: 14px 24px;
    font-size: 1rem;
  }

  .char-display {
    font-size: 2.5rem;
  }

  .encoding-tabs {
    gap: 4px;
  }

  .encoding-tab {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .card-header h2,
  .card-header h3 {
    font-size: 1rem;
  }
}
</style> 