const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/lib/**/*.{ts,tsx}",
    "app/login/**/*.{ts,tsx}",
    "app/me/**/*.{ts,tsx}",
    "app/admin/page.tsx",
    "app/2fa/**/*.{ts,tsx}",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "app/admin/users/page.tsx",
    "app/layout.tsx",
    "app/page.tsx",
  ],
};

module.exports = createJestConfig(customJestConfig);
