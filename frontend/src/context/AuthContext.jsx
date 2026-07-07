import { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin } from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "pothole_admin_token";
const USERNAME_KEY = "pothole_admin_username";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY));

  const login = useCallback(async (user, pass) => {
    const data = await apiLogin(user, pass);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USERNAME_KEY, data.username);
    setToken(data.access_token);
    setUsername(data.username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
