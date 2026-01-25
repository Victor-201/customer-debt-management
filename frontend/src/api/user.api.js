import axiosClient from "./axiosClient";

const userApi = {
  getAll: () => axiosClient.get("/api/users"),
  getDeleted: () => axiosClient.get("/api/users/deleted"),
  getById: (id) => axiosClient.get(`/api/users/${id}`),

  create: (data) => axiosClient.post("/api/users", data),
  update: (id, data) => axiosClient.patch(`/api/users/${id}`, data),

  lock: (id) => axiosClient.post(`/api/users/${id}/lock`),
  unlock: (id) => axiosClient.post(`/api/users/${id}/unlock`),

  softDelete: (id) => axiosClient.delete(`/api/users/${id}/soft`),
  restore: (id) => axiosClient.post(`/api/users/${id}/restore`),

  hardDelete: (id) => axiosClient.delete(`/api/users/${id}/hard`),
  hardDeleteAll: () => axiosClient.delete("/api/users/hard/all"),
};

export default userApi;
