module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.js$": "babel-jest", // Use Babel to transform JavaScript files
    },
    moduleFileExtensions: ["js", "json", "node"],
    transformIgnorePatterns: [
      "/node_modules/(?!axios)", // Allow axios to be transformed
    ],
  };
  