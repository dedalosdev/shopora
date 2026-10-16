import React, { createContext, useContext, useEffect, useState,} from "react";
import { login as loginService, logout as logoutService, LoginCredentials,} from "../services/authService";
import { getAccessToken, getRefreshToken,} from "../services/tokenStorage";

type AuthContextData = {
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    credentials: LoginCredentials
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextData | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthentication() {
      try {
        const accessToken =
          await getAccessToken();

        const refreshToken =
          await getRefreshToken();

        setIsAuthenticated(
          Boolean(accessToken || refreshToken)
        );
      } catch (error) {
        console.error(
          "AUTH LOAD ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadAuthentication();
  }, []);

  const login = async (
    credentials: LoginCredentials
  ) => {
    await loginService(credentials);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await logoutService();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}