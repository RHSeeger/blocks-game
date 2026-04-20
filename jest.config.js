export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/*.test.ts'],
    // ts-jest config moved from deprecated 'globals' to 'transform' as recommended
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            { tsconfig: 'tsconfig.json' }
        ]
    },
    // Store Jest/ts-jest cache and generated files in .jest-cache
    cacheDirectory: '<rootDir>/.jest-cache'
};
