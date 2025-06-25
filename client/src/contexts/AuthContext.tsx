import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  token: string | null;
  userId: string | null;
  email: string | null;
  login: (token: string, userId: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in on app start
    const storedToken = localStorage.getItem("jwtToken");
    const storedUserId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedToken && storedEmail && storedUserId) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setToken(storedToken);
      setUserId(storedUserId);
    }
  }, []);

  const login = (token: string, userId: string, email: string) => {
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userEmail", email);
    setIsLoggedIn(true);
    setUserEmail(email);
    setToken(token);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail(null);
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userEmail,
        token,
        userId,
        email: userEmail, // Alias for consistency
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
