/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/:path*',
      },
    ]
  },
  images: {
    domains: ['127.0.0.1', 'localhost'],
    unoptimized: true
  }
}

module.exports = nextConfig
