import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Helper to get items from storage on load
const getInitialState = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const userJson =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      console.error("Error parsing user from storage", e);
    }
  }
  return { token, user };
};

const initialState = getInitialState();

export const useAuthStore = create((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  loading: false,
  error: null,

  register: async (name, email, password, role, rememberMe) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role,
      });

      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      set({ user, token, loading: false, error: null });
      return user;
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Registration failed. Please try again.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  login: async (email, password, role, rememberMe) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        role,
      });

      const { token, user } = response.data;

      // Store in appropriate storage
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      set({ user, token, loading: false, error: null });
      return user;
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Login failed. Please try again.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),

  // Set updated user info (e.g. if we refresh state)
  setUser: (user) => set({ user }),

  // Verify token and fetch fresh profile from API
  checkAuth: async () => {
    const token = get().token;
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { user } = response.data;

      // Keep storage in sync
      const storage = localStorage.getItem("token")
        ? localStorage
        : sessionStorage;
      storage.setItem("user", JSON.stringify(user));

      set({ user });
      return user;
    } catch (err) {
      console.error("Session verification failed, logging out:", err);
      get().logout();
      return null;
    }
  },
}));
