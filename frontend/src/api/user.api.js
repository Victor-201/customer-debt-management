import axiosClient from "./axiosClient";

const userApi = {
  getAll: () => axiosClient.get("/users"),
  getDeleted: () => axiosClient.get("/users/deleted"),
  getById: (id) => axiosClient.get(`/users/${id}`),

  create: (data) => axiosClient.post("/users", data),
  update: (id, data) => axiosClient.patch(`/users/${id}`, data),

  lock: (id) => axiosClient.post(`/users/${id}/lock`),
  unlock: (id) => axiosClient.post(`/users/${id}/unlock`),

  softDelete: (id) => axiosClient.delete(`/users/${id}/soft`),
  restore: (id) => axiosClient.post(`/users/${id}/restore`),

  hardDelete: (id) => axiosClient.delete(`/users/${id}/hard`),
  hardDeleteAll: () => axiosClient.delete("/users/hard/all"),
};

export default userApi;
