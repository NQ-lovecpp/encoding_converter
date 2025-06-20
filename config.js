// 全局项目配置
window.GLOBAL_CONFIG = {
  // API配置
  API: {
    // 开发环境 (本地)
    DEVELOPMENT: 'http://localhost:15000/api',
    
    // 生产环境 (您的服务器)
    PRODUCTION: 'http://117.72.15.209:15000/api',
    
    // 当前使用的环境 (可以动态切换)
    CURRENT: 'http://117.72.15.209:15000/api'
  },
  
  // 端口配置
  PORTS: {
    API: 15000,
    VUE: 15001,
    HTML: 15002
  },
  
  // 其他全局配置
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 10000,
  DEFAULT_ENCODINGS: ['utf-8', 'utf-16', 'gbk', 'ascii']
};

// 便捷函数
window.getApiUrl = () => window.GLOBAL_CONFIG.API.CURRENT;
window.setApiUrl = (url) => { window.GLOBAL_CONFIG.API.CURRENT = url; };
window.useDevApi = () => { window.GLOBAL_CONFIG.API.CURRENT = window.GLOBAL_CONFIG.API.DEVELOPMENT; };
window.useProdApi = () => { window.GLOBAL_CONFIG.API.CURRENT = window.GLOBAL_CONFIG.API.PRODUCTION; }; 