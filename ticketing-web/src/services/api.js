import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Otomatis tempelkan JWT token dari localStorage ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("flashtix_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Tangani jika token kedaluwarsa (401) secara terpusat
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("flashtix_token");
      localStorage.removeItem("flashtix_user");
    }
    return Promise.reject(error);
  },
);

export default api;
