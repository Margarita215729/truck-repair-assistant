export default {
  // Next.js config for production compatibility
  experimental: {
    turbo: {
      rules: {
        '*.ts': ['@next/typescript/compiled'],
        '*.tsx': ['@next/typescript/compiled']
      }
    }
  },
  typescript: {
    // Type checking for Vercel build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint during builds
    ignoreDuringBuilds: false,
  },
  env: {
    // Force production environment variables
    NODE_ENV: 'production',
  },
  // Vercel compatibility
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
};
