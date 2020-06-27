module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/*.spec.+(ts)"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  moduleNameMapper: {
    "@(.*)/(.*)/(.*)": "<rootDir>/../$2/src/$3",
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
}
