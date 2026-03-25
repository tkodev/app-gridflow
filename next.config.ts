import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/profiles', destination: '/plan', permanent: true },
      { source: '/auth/login', destination: '/auth/sign-in', permanent: true }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
}

export default nextConfig
