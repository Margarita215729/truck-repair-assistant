/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment - no static export needed
  // output: 'export', // Commented out for Vercel
  
  // Keep image optimization enabled for Vercel
  images: {
    domains: ['dtnacontent-dtna.prd.freightliner.com', 'successleasing.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // No basePath needed for Vercel deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant/' : '',
  
  // Optional trailing slash for compatibility
  trailingSlash: false,
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration to handle Node.js modules in browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        // Additional Node.js modules used by Azure AI Projects SDK
        http2: false,
        dns: false,
        dgram: false,
        cluster: false,
        readline: false,
        repl: false,
        inspector: false,
        worker_threads: false,
        perf_hooks: false,
        async_hooks: false,
        trace_events: false,
        v8: false,
        constants: false,
        module: false,
        domain: false,
        timers: false,
        string_decoder: false,
        util: false,
        querystring: false,
        punycode: false,
        child_process: false,
        vm: false,
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        events: require.resolve('events/'),
      };
    }
    
    // Ignore Azure telemetry modules that cause issues
    config.externals = config.externals || [];
    config.externals.push({
      '@opentelemetry/api': 'commonjs @opentelemetry/api',
      '@opentelemetry/instrumentation': 'commonjs @opentelemetry/instrumentation',
      '@opentelemetry/otlp-grpc-exporter-base': 'commonjs @opentelemetry/otlp-grpc-exporter-base',
      '@opentelemetry/exporter-trace-otlp-grpc': 'commonjs @opentelemetry/exporter-trace-otlp-grpc',
      '@grpc/grpc-js': 'commonjs @grpc/grpc-js',
    });
    
    return config;
  },
  
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
