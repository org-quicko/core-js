import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	collectCoverage: true,
	watchAll: false,
	coveragePathIgnorePatterns: ["node_modules", "dist"],
	testTimeout: 30000,
	modulePathIgnorePatterns: ["./node_modules", "./dist/"],
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	transform: {
		"^.+\\.tsx?$": ["ts-jest", { useESM: true }],
	},
	moduleFileExtensions: ["ts", "js", "json"],
};

export default config;
