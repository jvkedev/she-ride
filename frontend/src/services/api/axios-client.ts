import axios from "axios";
import { refreshAccessToken, logout } from "@/services/auth/auth.service";
import { getAccessToken } from "@/lib/auth/session";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase?.() || "";

    // Blocked account
    if (status === 403 && message.includes("blocked")) {
      logout();

      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=blocked";
      }

      return Promise.reject(error);
    }

    // Token expired
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        if (!newToken) {
          logout();

          if (typeof window !== "undefined") {
            window.location.href = "/login?reason=session_expired";
          }

          return Promise.reject(error);
        }

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        return axiosClient(originalRequest);
      } catch (refreshError) {
        logout();

        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=session_expired";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
