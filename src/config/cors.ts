// Environment-based allowed origins
export const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return [
      'https://your-production-domain.com',  // Replace with your actual production domain
      'https://www.your-production-domain.com',  // Include www subdomain if needed
      'https://biggreenegg.com',
      'https://www.biggreenegg.com',
      // Add wildcard origins to ensure flexibility
      '*',  // This will allow all origins in production
    ];
  }
  
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    '*',  // Add wildcard to support all local development scenarios
  ];
};

// CORS configuration
export const corsConfig = {
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
  credentials: true,
}; 