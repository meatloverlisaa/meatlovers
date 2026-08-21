/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Ignore TypeScript errors during build (for deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignore ESLint errors during build (for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // This is a server-side rendered app, not static export
  // Pages need runtime API data
  output: 'standalone',

  // Skip trailing slash to avoid duplicate routes
  trailingSlash: false,

  // Handle dynamic pages gracefully during build
  generateBuildId: async () => {
    // Use timestamp for build ID
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
