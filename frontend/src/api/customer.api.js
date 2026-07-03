import apiClient from "./axiosClient";

export const customerApi = {
  // ======================
  // CREATE
  // ======================
  createCustomer(data) {
    return apiClient.post("/api/customers", data);
  },

  // Lấy danh sách khách hàng (có phân trang)
  getAllCustomers(params = {}) {
    return apiClient.get("/api/customers", { params });
  },

  // ======================
  // READ - DETAIL
  // ======================
  getCustomerById(customerId) {
    return apiClient.get(`/api/customers/${customerId}`);
  },

  // ======================
  // UPDATE
  // ======================
  updateCustomer(customerId, data) {
    return apiClient.put(`/api/customers/${customerId}`, data);
  },

  updateCustomerStatus(customerId, status) {
    return apiClient.patch(`/api/customers/${customerId}/status`, { status });
  },

  assessCustomerRisk(customerId) {
    return apiClient.patch(`/api/customers/${customerId}/assess-risk`);
  },

  // ======================
  // DELETE
  // ======================
  deleteCustomer(customerId) {
    return apiClient.delete(`/api/customers/${customerId}`);
  },
};
