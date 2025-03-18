import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.mjs"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  // Transform ESM modules that are not normally transformed by default
  transformIgnorePatterns: [
    "/node_modules/(?!react-markdown|vfile|unist|unified|mdast|remark|micromark|decode-named-character-reference|character-entities|property-information|hast|hastscript|web-namespaces|zwitch|bail|trough|is-plain-obj|longest-streak)",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
