import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export let accessToken = '';
export let refreshToken = '';
export let adminUserId = '';

describe('Authentication & Authorization', () => {

  afterAll(() => {
    // Clean up axios agent if exists
    if (axios.defaults.httpAgent?.destroy) axios.defaults.httpAgent.destroy();
    if (axios.defaults.httpsAgent?.destroy) axios.defaults.httpsAgent.destroy();
  });

  test('Admin registration', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        {
          name: 'System Admin',
          email: 'admin@armanagement.com',
          password: 'admin123',
          role: 'ADMIN'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      adminUserId = response.data.id;
      console.log('Admin registered:', adminUserId);
    } catch (error) {
      if (error.response?.status === 400 && /already exists/i.test(error.response.data?.error)) {
        console.log('Admin already exists, skipping registration');
      } else {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
      }
    }
  });

  test('Login', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email: 'admin@armanagement.com',
          password: 'admin123'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
      adminUserId = response.data.user.id;

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(adminUserId).toBeDefined();
      console.log('Login successful:', adminUserId);
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  });

  test('Refresh token', async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(response.data.accessToken).toBeDefined();
      accessToken = response.data.accessToken;
      console.log('Access token refreshed');
    } catch (error) {
      console.error('Refresh token error:', error.response?.data || error.message);
      throw error;
    }
  });

});
