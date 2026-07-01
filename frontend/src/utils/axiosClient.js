import axios from "axios";
import { getToken, clearSession } from "./auth";
import { disconnectSocket } from "./socket";

const API_BASE_URL = "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_BASE_URL,
  withCredentials: true,
});

// Attach the JWT to every outgoing request automatically, so individual
// components never have to remember to read localStorage themselves.
axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever responds 401 (missing / invalid / expired token),
// the session is no longer good for anything — clear it and send the
// user back to log in again instead of letting the app sit in a broken state.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
      disconnectSocket();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
