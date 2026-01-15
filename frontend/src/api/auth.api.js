import apiClient from "./axiosClient";

export const authApi = {
  login(data) {
    return apiClient.post("/auth/login", data);
  },

  refresh() {
    return apiClient.post("/auth/refresh-token");
  },

  logout() {
    return apiClient.post("/auth/logout");
  },
};
