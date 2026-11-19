import { createContext, useContext, useState } from "react";
import * as authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("flashtix_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const saveSession = ({ user, token }) => {
    localStorage.setItem("flashtix_token", token);
    localStorage.setItem("flashtix_user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    saveSession(data);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    saveSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("flashtix_token");
    localStorage.removeItem("flashtix_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
