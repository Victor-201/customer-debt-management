import apiClient from "./axiosClient";

export const authApi = {
  login(data) {
    return apiClient.post("/api/auth/login", data);
  },

  refresh() {
    return apiClient.post("/api/auth/refresh-token");
  },

  logout() {
    return apiClient.post("/api/auth/logout");
  },
};
