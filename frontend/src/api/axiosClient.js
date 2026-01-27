import axios from "axios";

const BASE =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_GATEWAY_URL || "";

const apiClient = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;

/* ================= REQUEST ================= */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

/* ================= RESPONSE ================= */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isRefreshRequest = error.config?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !isRefreshRequest && !isRefreshing) {
      isRefreshing = true;
      window.dispatchEvent(new Event("auth:unauthorized"));
      // Reset flag after a delay to allow retry
      setTimeout(() => { isRefreshing = false; }, 3000);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

