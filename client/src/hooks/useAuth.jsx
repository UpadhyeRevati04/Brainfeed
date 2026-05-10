import { useState, useEffect, createContext, useContext } from "react";
import { api } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bf_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bf_token");
    if (!token) { setLoading(false); return; }
    api.me()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => {
        localStorage.removeItem("bf_token");
        localStorage.removeItem("bf_user");
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("bf_token", data.token);
    localStorage.setItem("bf_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    localStorage.setItem("bf_token", data.token);
    localStorage.setItem("bf_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("bf_token");
    localStorage.removeItem("bf_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}