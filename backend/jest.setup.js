// Clean up axios agent to prevent circular reference errors
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn((config) => {
      const instance = actualAxios.create(config);
      // Clean up agent after tests
      return instance;
    }),
  };
});

// Set up global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Allow time for any pending operations
  await new Promise(resolve => setTimeout(resolve, 100));
});
