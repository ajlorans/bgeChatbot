/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SHOPIFY_STORE_URL: process.env.SHOPIFY_STORE_URL,
    SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    AGENT_DASHBOARD_URL: process.env.AGENT_DASHBOARD_URL || "/agent-dashboard",
    DEBUG_MODE: process.env.DEBUG_MODE || "false",
    ALLOW_DEBUG_LOGIN: process.env.ALLOW_DEBUG_LOGIN || "false",
    CORS_ALLOW_ALL: process.env.CORS_ALLOW_ALL || "false",
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
  // Configure static and dynamic page behavior
  output: "standalone",
  // Skip static optimization for database-heavy pages
  unstable_excludeFiles: ["**/src/app/agent/sessions/**", "**/src/app/api/**"],
  // Redirect for agent dashboard
  async redirects() {
    return [
      {
        source: "/agent-dashboard",
        destination: "/agent-dashboard/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/login/agent",
        destination: "/agent-login",
      },
    ];
  },
  // Added to ensure socket connections work properly
  webpack: (config) => {
    config.externals = [
      ...(config.externals || []),
      { bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" },
    ];
    return config;
  },
};

export default nextConfig;
