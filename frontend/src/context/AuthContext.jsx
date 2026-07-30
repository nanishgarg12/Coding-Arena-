import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("codearena_token")));

  useEffect(() => {
    if (!localStorage.getItem("codearena_token")) return;
    authApi.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("codearena_token"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(payload) {
      const { data } = await authApi.login(payload);
      localStorage.setItem("codearena_token", data.token);
      setUser(data.user);
    },
    async register(payload) {
      const { data } = await authApi.register(payload);
      localStorage.setItem("codearena_token", data.token);
      setUser(data.user);
    },
    logout() {
      localStorage.removeItem("codearena_token");
      setUser(null);
    },
    setUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
