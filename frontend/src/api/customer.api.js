import apiClient from "./axiosClient";

export const customerApi = {
  // Tạo khách hàng mới
  createCustomer(data) {
    return apiClient.post("/api/customers", data);
  },

  // Lấy danh sách khách hàng (có phân trang)
  getAllCustomers(params = {}) {
    return apiClient.get("/api/customers", { params });
  },

  // Lấy khách hàng theo ID
  getCustomerById(id) {
    return apiClient.get(`/api/customers/${id}`);
  },

  // Cập nhật khách hàng
  updateCustomer(id, data) {
    return apiClient.put(`/api/customers/${id}`, data);
  },

  // Xóa khách hàng
  deleteCustomer(id) {
    return apiClient.delete(`/api/customers/${id}`);
  },

  // Cập nhật trạng thái khách hàng
  updateStatus(id, status) {
    return apiClient.patch(`/api/customers/${id}/status`, { status });
  },

  // Đánh giá rủi ro khách hàng
  assessRisk(id) {
    return apiClient.patch(`/api/customers/${id}/assess-risk`);
  },
};
