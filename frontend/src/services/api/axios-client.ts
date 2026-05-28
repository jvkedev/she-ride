import axios from "axios";
import { refreshAccessToken, logout } from "@/services/auth/auth.service";
import { getAccessToken } from "@/lib/auth/session";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "";

    // ── Blocked account ───────────────────────────────────────────
    if (status === 403 && message.toLowerCase().includes("blocked")) {
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=blocked";
      }
      return Promise.reject(error);
    }

    // ── Token expired — try refresh ───────────────────────────────
    if (status === 401 && !original._retry) {
      original._retry = true;

      const newToken = await refreshAccessToken();

      if (!newToken) {
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=session_expired";
        }
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(original);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
