/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  // Disable static page generation to avoid build-time env var issues
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
