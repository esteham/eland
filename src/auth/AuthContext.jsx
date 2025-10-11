/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try fetch /me on load if token exists
  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/me");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
      }
      setLoading(false);
    };
    boot();
  }, []);

  // const register = async (payload) => {
  //   const { data } = await api.post("/register", payload);
  //   localStorage.setItem("token", data.token);
  //   setUser(data.user);
  // };

  const register = async (payload) => {
    const { data } = await api.post("/register", payload);
    return data;
  };

  const checkEmail = async (email) => {
    const { data } = await api.post("/check-email", { email });
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post("/login", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user.role;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      /* empty */
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthCtx.Provider
      value={{ user, loading, register, login, logout, updateUser, checkEmail }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
