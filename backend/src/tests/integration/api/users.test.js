import axios from 'axios';
import { accessToken } from './auth.test.js';

const BASE_URL = 'http://localhost:3000/api';

describe('User Management API', () => {

  const authHeaders = () => ({ Authorization: `Bearer ${accessToken}` });

  afterAll(() => {
    // Clean up axios agent
    if (axios.defaults.httpAgent) {
      axios.defaults.httpAgent.destroy();
    }
    if (axios.defaults.httpsAgent) {
      axios.defaults.httpsAgent.destroy();
    }
  });

  test('Create accountant user', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        name: 'John Accountant',
        email: 'accountant@armanagement.com',
        password: 'accountant123',
        role: 'ACCOUNTANT'
      }, { headers: authHeaders() });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    } catch (error) {
      if (error.response?.status === 400) {
        expect(error.response.data.error).toMatch(/already exists/);
      } else {
        throw error;
      }
    }
  });

  test('Get all users', async () => {
    const response = await axios.get(`${BASE_URL}/users`, { headers: authHeaders() });
    expect(Array.isArray(response.data)).toBe(true);
  });

});
