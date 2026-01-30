import apiClient from "./axiosClient";

export const customerApi = {
  // ======================
  // CREATE
  // ======================
  createCustomer(data) {
    return apiClient.post("/api/customers", data);
  },

  // ======================
  // READ - LIST
  // ======================
  getListCustomers({
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    paymentTerm,
    riskLevel,
    status,
  } = {}) {
    return apiClient.get("/api/customers", {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        paymentTerm,
        riskLevel,
        status,
      },
    });
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
