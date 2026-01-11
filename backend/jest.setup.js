jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn((config) => {
      const instance = actualAxios.create(config);
      return instance;
    }),
  };
});

jest.setTimeout(10000);

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});
