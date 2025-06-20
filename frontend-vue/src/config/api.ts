// API配置 - 优先使用全局配置
declare global {
  interface Window {
    GLOBAL_CONFIG?: {
      API: {
        DEVELOPMENT: string;
        PRODUCTION: string;
        CURRENT: string;
      };
      PORTS: {
        API: number;
        VUE: number;
        HTML: number;
      };
      MAX_FILE_SIZE: number;
      MAX_TEXT_LENGTH: number;
      DEFAULT_ENCODINGS: string[];
    };
    getApiUrl?: () => string;
    setApiUrl?: (url: string) => void;
    useDevApi?: () => void;
    useProdApi?: () => void;
  }
}

// 获取API基础URL的函数
function getBaseUrl(): string {
  // 1. 优先使用全局配置
  if (typeof window !== 'undefined' && window.GLOBAL_CONFIG?.API?.CURRENT) {
    return window.GLOBAL_CONFIG.API.CURRENT;
  }
  
  // 2. 使用环境变量
  if ((import.meta as any).env?.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }
  
  // 3. 根据环境自动选择
  if ((import.meta as any).env?.DEV) {
    return 'http://localhost:15000/api'; // 开发环境
  }
  
  // 4. 生产环境默认值
  return 'http://117.72.15.209:15000/api';
}

export const API_CONFIG = {
  // 基础URL配置 - 动态获取
  get BASE_URL() {
    return getBaseUrl();
  },
  
  // 超时配置
  TIMEOUT: 30000,
  
  // 其他配置 - 优先使用全局配置
  get MAX_FILE_SIZE() {
    return (typeof window !== 'undefined' && window.GLOBAL_CONFIG?.MAX_FILE_SIZE) 
      || 10 * 1024 * 1024; // 10MB
  },
  
  get MAX_TEXT_LENGTH() {
    return (typeof window !== 'undefined' && window.GLOBAL_CONFIG?.MAX_TEXT_LENGTH) 
      || 10000;
  },
  
  // 默认编码
  get DEFAULT_ENCODINGS() {
    return (typeof window !== 'undefined' && window.GLOBAL_CONFIG?.DEFAULT_ENCODINGS) 
      || ['utf-8', 'utf-16', 'gbk', 'ascii'];
  }
}

// 导出API基础URL获取函数
export const getApiBaseUrl = () => API_CONFIG.BASE_URL;

// 导出配置切换函数
export const switchToDevApi = () => {
  if (typeof window !== 'undefined' && window.useDevApi) {
    window.useDevApi();
  }
};

export const switchToProdApi = () => {
  if (typeof window !== 'undefined' && window.useProdApi) {
    window.useProdApi();
  }
};

export const setCustomApiUrl = (url: string) => {
  if (typeof window !== 'undefined' && window.setApiUrl) {
    window.setApiUrl(url);
  }
}; 