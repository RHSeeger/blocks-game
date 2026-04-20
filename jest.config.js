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
    }
};
