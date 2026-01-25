import apiClient from "./axiosClient";

export const customerApi = {
  // Tạo khách hàng mới
  createCustomer(data) {
    return apiClient.post("/api/customers", data);
  },

  // Lấy danh sách khách hàng
  getAllCustomers() {
    return apiClient.get("/api/customers");
  },

  // Lấy khách hàng theo ID
  getCustomerById(id) {
    return apiClient.get(`/api/customers/${id}`);
  },

  // Cập nhật khách hàng
  updateCustomer(id, data) {
    return apiClient.put(`/api/customers/${id}`, data);
  },

  // (Nếu backend có) Xóa khách hàng
  deleteCustomer(id) {
    return apiClient.delete(`/api/customers/${id}`);
  },
};
