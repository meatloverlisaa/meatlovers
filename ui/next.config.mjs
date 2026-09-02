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

  // This is a server-side rendered app, not static export. Standalone output
  // is only needed for production packaging and should not affect next dev.
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),

  // Keep development output separate from production builds. Running a build
  // while the dev server is active otherwise invalidates its generated chunks.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',

  // Skip trailing slash to avoid duplicate routes
  trailingSlash: false,

};

export default nextConfig;
