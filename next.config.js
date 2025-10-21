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
  // Skip middleware and edge runtime validation for internal Next.js routes
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

module.exports = nextConfig
