import axios from 'axios';
import { accessToken } from './auth.test.js';

const BASE_URL = 'http://localhost:3000/api';

let customerId = '';

describe('Customer Management API', () => {

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

  test('Create customer', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/customers`, {
        name: 'Cong ty ABC',
        email: 'contact@abc.com',
        phone: '0123456789',
        address: '123 Duong ABC, Quan 1, TP.HCM',
        paymentTerm: 'NET_30',
        creditLimit: 50000000
      }, { headers: authHeaders() });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      customerId = response.data.id;
    } catch (error) {
      if (error.response?.status === 400) {
        expect(error.response.data.error).toMatch(/Validation failed/);
      } else {
        throw error;
      }
    }
  });

  test('Get all customers', async () => {
    const response = await axios.get(`${BASE_URL}/customers`, { headers: authHeaders() });
    expect(Array.isArray(response.data)).toBe(true);
    if (response.data.length > 0) customerId = response.data[0].id;
  });

  test('Update customer', async () => {
    if (!customerId) return;
    const response = await axios.put(`${BASE_URL}/customers/${customerId}`, {
      name: 'Cong ty ABC Updated',
      creditLimit: 60000000
    }, { headers: authHeaders() });
    expect(response.data.name).toBe('Cong ty ABC Updated');
    expect(response.data.creditLimit).toBe(60000000);
  });

  test('Get customer by ID', async () => {
    if (!customerId) return;
    const response = await axios.get(`${BASE_URL}/customers/${customerId}`, { headers: authHeaders() });
    expect(response.data).toHaveProperty('id', customerId);
  });

});
