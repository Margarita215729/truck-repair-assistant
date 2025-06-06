/** @type {import('next').NextConfig} */
const nextConfig = {
  // Статический экспорт для GitHub Pages
  output: 'export',
  
  // Отключаем оптимизацию изображений для статического экспорта
  images: {
    unoptimized: true
  },
  
  // Настройка для GitHub Pages (если деплоим в поддиректорию)
  // basePath: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant/' : '',
  
  // Отключаем trailing slash для совместимости с GitHub Pages
  trailingSlash: true,
  
  // Экспериментальные фичи
  experimental: {
    // Включаем app directory (уже включен по умолчанию в Next.js 13+)
  },
  
  // Конфигурация для работы с внешними API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
