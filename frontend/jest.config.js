// jest.config.js

module.exports = {
  // Set the test environment to jsdom for React
  testEnvironment: "jsdom",

  // Transform JavaScript and JSX using Babel
  transform: {
    "^.+\\.jsx?$": "babel-jest", // Use babel-jest to transform JavaScript/JSX files
  },

  // Define where Jest should look for test files
  testMatch: ["*/src//.test.js", "*/src//.spec.js"],

  // Setup files before tests are run
  setupFilesAfterEnv: ["<rootDir>/.jest/jest.setup.js"],

  // Mock static files (like images, styles, etc.)
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/.jest/mocks/styleMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/.jest/mocks/fileMock.js",
  },

  // Collect coverage and specify where to output
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["html", "text", "lcov"],

  // Optional: Ignore test files for certain directories
  modulePathIgnorePatterns: ["<rootDir>/node_modules/"],
}

