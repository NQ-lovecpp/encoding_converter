// API配置
export const API_CONFIG = {
  // 基础URL配置
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://117.72.15.209:15000/api',
  
  // 超时配置
  TIMEOUT: 30000,
  
  // 其他配置
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 10000,
  
  // 默认编码
  DEFAULT_ENCODINGS: ['utf-8', 'utf-16', 'gbk', 'ascii']
}

// 导出API基础URL
export const getApiBaseUrl = () => API_CONFIG.BASE_URL 