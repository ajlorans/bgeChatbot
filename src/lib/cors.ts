import { NextApiRequest, NextApiResponse } from 'next';
import { getAllowedOrigins, corsConfig } from '@/config/cors';

export function corsMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the origin from the request headers
    const origin = req.headers.origin;
    const allowedOrigins = getAllowedOrigins();

    // Check if the origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString());
      
      if (corsConfig.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Call the actual handler
    return handler(req, res);
  };
} 