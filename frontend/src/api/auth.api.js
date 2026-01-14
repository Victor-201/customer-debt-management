import apiClient from "./axiosClient";

export const authApi = {
  login(data) {
    return apiClient.post("/auth/login", data);
  },

  refresh(refreshToken) {
    return apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
  },

  logout() {
    return apiClient.post("/auth/logout");
  },
};