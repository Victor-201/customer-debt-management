import axiosClient from './axiosClient';

export const loginApi = (data) =>
  axiosClient.post('/auth/login', data);
