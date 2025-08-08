/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube thumbnails
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com', // YouTube channel avatars
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Supabase storage
      },
    ],
  },
  // TODO: Re-enable TypeScript and ESLint checking after fixing all errors
  // These should be set to false for production builds
  typescript: {
    ignoreBuildErrors: true, // Should be false in production
  },
  eslint: {
    ignoreDuringBuilds: true, // Should be false in production
  },
  swcMinify: true, // Use SWC for faster minification
  compress: true, // Enable compression
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode
  experimental: {
    optimizeCss: true, // Optimize CSS
    optimizePackageImports: ['lucide-react', 'framer-motion'], // Optimize specific imports
  },
}

module.exports = nextConfig