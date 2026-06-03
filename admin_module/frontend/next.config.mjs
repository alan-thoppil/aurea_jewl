/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/express/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5002'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
