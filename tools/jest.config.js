module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/*.spec.+(ts)"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  moduleNameMapper: {
    "@psousa50/shared/(.*)": "<rootDir>/../shared/src/$1",
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
}
