export default {
  // Next.js config for production compatibility  
  typescript: {
    // Type checking for Vercel build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint during builds
    ignoreDuringBuilds: false,
  },
  // Vercel compatibility
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
};
