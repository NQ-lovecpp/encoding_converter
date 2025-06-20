# API配置更新脚本 (PowerShell版本)
# 用法: .\update-api-config.ps1 [新的API地址]

param(
    [string]$ApiUrl = "http://117.72.15.209:15000"
)

Write-Host "🔧 更新API配置到: $ApiUrl" -ForegroundColor Cyan

# 更新Vue项目配置
Write-Host "📱 更新Vue项目配置..." -ForegroundColor Yellow
(Get-Content "frontend-vue\.env") -replace "VITE_API_BASE_URL=.*", "VITE_API_BASE_URL=$ApiUrl/api" | Set-Content "frontend-vue\.env"
(Get-Content "frontend-vue\.env.production") -replace "VITE_API_BASE_URL=.*", "VITE_API_BASE_URL=$ApiUrl/api" | Set-Content "frontend-vue\.env.production"

# 更新前端JavaScript配置
Write-Host "🌐 更新原版HTML配置..." -ForegroundColor Yellow
(Get-Content "frontend\config.js") -replace "API_BASE_URL: '[^']*'", "API_BASE_URL: '$ApiUrl/api'" | Set-Content "frontend\config.js"

# 更新Vite代理配置
Write-Host "⚙️ 更新Vite代理配置..." -ForegroundColor Yellow
(Get-Content "frontend-vue\vite.config.ts") -replace "target: '[^']*'", "target: '$ApiUrl'" | Set-Content "frontend-vue\vite.config.ts"

Write-Host "✅ API配置更新完成!" -ForegroundColor Green
Write-Host "🔄 请重新构建Vue项目: Set-Location frontend-vue; npm run build" -ForegroundColor Magenta
Write-Host "🚀 然后重启服务器以应用更改" -ForegroundColor Magenta 