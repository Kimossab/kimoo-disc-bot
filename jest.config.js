module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ".*.ts": ['ts-jest', {
      isolatedModules: true
    }],
  },
  moduleNameMapper: {
    "^#(.*)": '<rootDir>/src/modules/$1',
    "^@\/(.*)": '<rootDir>/src/$1'
  }
};