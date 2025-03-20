// Global configuration for Next.js

// Prevent static page generation for the entire app
export const dynamic = "force-dynamic";

// Prevent static image optimization
export const images = {
  unoptimized: true,
};

// Disable static generation for all routes
export const generateStaticParams = () => {
  return [];
};
