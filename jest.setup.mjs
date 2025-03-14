// Import jest-dom for DOM element assertions
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  OPENAI_API_KEY: "test-openai-key",
  SHOPIFY_STORE_URL: "test-shopify-url",
  SHOPIFY_ACCESS_TOKEN: "test-shopify-token",
};
