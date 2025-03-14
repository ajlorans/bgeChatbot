interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.requests = new Map();
    this.config = config;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.config.windowMs
    );

    if (recentTimestamps.length >= this.config.maxRequests) {
      return true;
    }

    recentTimestamps.push(now);
    this.requests.set(identifier, recentTimestamps);
    return false;
  }

  clear(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Create a rate limiter instance with default settings
// 100 requests per 15 minutes
export const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
}); 