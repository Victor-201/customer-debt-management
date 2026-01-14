import axios from "axios";

const BASE =
  import.meta.env.VITE_API_GATEWAY_URL ||
  import.meta.env.VITE_GATEWAY_URL ||
  "http://localhost:3000";

const API_PREFIX = "/api";

const apiClient = axios.create({
  baseURL: BASE + API_PREFIX,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data && typeof config.data === "object") {
      config.headers["Content-Type"] ??= "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw error;

        const res = await axios.post(
          `${BASE}${API_PREFIX}/auth/refresh`,
          { refresh_token: refreshToken },
          { withCredentials: true }
        );

        const newAccess = res.data?.access_token;
        const newRefresh = res.data?.refresh_token;

        if (!newAccess) throw error;

        localStorage.setItem("access_token", newAccess);
        if (newRefresh) {
          localStorage.setItem("refresh_token", newRefresh);
        }

        apiClient.defaults.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
