import 'jest';

// Global test timeout (10 seconds)
jest.setTimeout(10000);

// Global beforeAll hook - runs once before all tests
beforeAll(() => {
  console.log('Starting test suite...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.FIREBASE_PROJECT_ID = 'test-project';
});

// Global beforeEach hook - runs before each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset environment state
  process.env.NODE_ENV = 'test';
});

// Global afterAll hook - runs after all tests
afterAll(() => {
  console.log('Test suite completed');
  
  // Cleanup any global resources
  jest.restoreAllMocks();
});

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Custom Jest matchers for more expressive tests
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Type definitions for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// Global test utilities
(global as any).testUser = {
  uid: 'test-user-123',
  email: 'test@loanapp.com',
  role: 'user'
};

(global as any).testOfficer = {
  uid: 'test-officer-456', 
  email: 'officer@loanapp.com',
  role: 'officer'
};

(global as any).testManager = {
  uid: 'test-manager-789',
  email: 'manager@loanapp.com', 
  role: 'manager'
};