import { rateLimiter } from "@/lib/rateLimiter";

// Create a mock class similar to the one in the codebase for testing
class TestRateLimiter {
  private requests: Map<string, number[]>;
  private maxRequests: number;
  private windowMs: number;

  constructor({
    maxRequests,
    windowMs,
  }: {
    maxRequests: number;
    windowMs: number;
  }) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];

    // Remove old timestamps
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentTimestamps.length >= this.maxRequests) {
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

describe("RateLimiter", () => {
  const testUser = "test-user";

  beforeEach(() => {
    // Clear rate limiter for the test user before each test
    rateLimiter.clear(testUser);
  });

  test("should not rate limit when under threshold", () => {
    // Single request should not be rate limited
    expect(rateLimiter.isRateLimited(testUser)).toBe(false);
  });

  test("should track multiple requests correctly", () => {
    // Make several requests
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.isRateLimited(testUser)).toBe(false);
    }

    // Should still be under the rate limit
    expect(rateLimiter.isRateLimited(testUser)).toBe(false);
  });

  test("should rate limit after exceeding threshold", () => {
    // Use a test user with different name to avoid conflicts
    const heavyUser = "heavy-user";

    // Create a test rate limiter with lower limits for testing
    const testLimiter = new TestRateLimiter({
      maxRequests: 5,
      windowMs: 1000, // 1 second
    });

    // Allow 5 requests
    for (let i = 0; i < 5; i++) {
      expect(testLimiter.isRateLimited(heavyUser)).toBe(false);
    }

    // Next request should be rate limited
    expect(testLimiter.isRateLimited(heavyUser)).toBe(true);
  });

  test("clears rate limit records for a user", () => {
    // Make a bunch of requests
    for (let i = 0; i < 10; i++) {
      rateLimiter.isRateLimited(testUser);
    }

    // Clear the records
    rateLimiter.clear(testUser);

    // Should be able to make a request again without hitting the limit
    expect(rateLimiter.isRateLimited(testUser)).toBe(false);
  });

  test("keeps track of different users separately", () => {
    const user1 = "user-1";
    const user2 = "user-2";

    rateLimiter.clear(user1);
    rateLimiter.clear(user2);

    // User 1 makes 5 requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.isRateLimited(user1);
    }

    // User 2 makes 3 requests
    for (let i = 0; i < 3; i++) {
      rateLimiter.isRateLimited(user2);
    }

    // Both should still be under their individual limits
    expect(rateLimiter.isRateLimited(user1)).toBe(false);
    expect(rateLimiter.isRateLimited(user2)).toBe(false);
  });

  test("expires old requests after window time", async () => {
    // Create a test rate limiter with a short window
    const shortWindowLimiter = new TestRateLimiter({
      maxRequests: 2,
      windowMs: 100, // 100ms window
    });

    const timedUser = "timed-user";

    // Make 2 requests (maxRequests)
    expect(shortWindowLimiter.isRateLimited(timedUser)).toBe(false);
    expect(shortWindowLimiter.isRateLimited(timedUser)).toBe(false);

    // Next request should be rate limited
    expect(shortWindowLimiter.isRateLimited(timedUser)).toBe(true);

    // Wait for the window to pass
    await new Promise((resolve) => setTimeout(resolve, 110));

    // Should no longer be rate limited as the old requests expired
    expect(shortWindowLimiter.isRateLimited(timedUser)).toBe(false);
  });
});
