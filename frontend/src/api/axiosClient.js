import axios from "axios";

const BASE =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: BASE + "/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

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
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
