module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	"collectCoverageFrom": [
		"src/**/*.ts",
		"!src/**/*.d.ts",
		"!src/demoPage/**"
	]
};