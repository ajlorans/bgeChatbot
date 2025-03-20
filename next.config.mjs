/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SHOPIFY_STORE_URL: process.env.SHOPIFY_STORE_URL,
    SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize builds by controlling what happens during static generation
  experimental: {
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
    staticWorkerRequestDeadline: 60,
  },
};

export default nextConfig;
