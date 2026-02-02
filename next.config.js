/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Disable React 19 warnings for socket.io compatibility
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig
