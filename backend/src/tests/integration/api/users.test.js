import axios from 'axios';
import { accessToken } from './auth.test.js';

const BASE_URL = 'http://localhost:3000/api/users';

describe('Full User Management API', () => {
  const authHeaders = () => ({ Authorization: `Bearer ${accessToken}` });

  let createdUserId;

  afterAll(() => {
    if (axios.defaults.httpAgent) axios.defaults.httpAgent.destroy?.();
    if (axios.defaults.httpsAgent) axios.defaults.httpsAgent.destroy?.();
  });

  test('Create a new user', async () => {
    try {
      const response = await axios.post(BASE_URL, {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'ACCOUNTANT'
      }, { headers: authHeaders() });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      createdUserId = response.data.id;
    } catch (error) {
      if (error.response?.status === 400) {
        expect(error.response.data.error).toMatch(/already exists/i);
      } else {
        throw error;
      }
    }
  });

  test('Get all users', async () => {
    const response = await axios.get(BASE_URL, { headers: authHeaders() });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Get single user by ID', async () => {
    const response = await axios.get(`${BASE_URL}/${createdUserId}`, { headers: authHeaders() });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', createdUserId);
  });

  test('Update user (PATCH)', async () => {
    const response = await axios.patch(`${BASE_URL}/${createdUserId}`, {
      name: 'Updated Test User'
    }, { headers: authHeaders() });

    expect(response.status).toBe(200);
    expect(response.data.name).toBe('Updated Test User');
  });

  test('Lock user', async () => {
    const response = await axios.post(`${BASE_URL}/${createdUserId}/lock`, {}, { headers: authHeaders() });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('locked', true);
  });

  test('Unlock user', async () => {
    const response = await axios.post(`${BASE_URL}/${createdUserId}/unlock`, {}, { headers: authHeaders() });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('locked', false);
  });

  test('Soft delete user', async () => {
    const response = await axios.delete(`${BASE_URL}/${createdUserId}/soft`, { headers: authHeaders() });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('deleted', true);
  });

  test('Get deleted users', async () => {
    const response = await axios.get(`${BASE_URL}/deleted`, { headers: authHeaders() });
    expect(response.status).toBe(200);
    const deletedUser = response.data.find(u => u.id === createdUserId);
    expect(deletedUser).toBeDefined();
  });

  test('Restore soft-deleted user', async () => {
    const response = await axios.post(`${BASE_URL}/${createdUserId}/restore`, {}, { headers: authHeaders() });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('deleted', false);
  });

  test('Hard delete user', async () => {
    const response = await axios.delete(`${BASE_URL}/${createdUserId}/hard`, { headers: authHeaders() });
    expect(response.status).toBe(200);
  });

  test('Hard delete all deleted users', async () => {
    const response = await axios.delete(`${BASE_URL}/hard/all`, { headers: authHeaders() });
    expect(response.status).toBe(200);
  });
});
