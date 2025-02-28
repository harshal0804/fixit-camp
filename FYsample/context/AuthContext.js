import React, { createContext, useContext, useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const apiUrl = "http://172.16.250.207:3000";

  const fetchApi = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        credentials: "include",
        ...options,
      });
      return response;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchApi("/auth/profile", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${apiUrl}/auth/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  };

  const register = async (credentials) => {
    try {
      const response = await fetchApi("/auth/users/register", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return {
        success: false,
        message: data.message || "Registration failed.",
      };
    } catch (err) {
      console.error("Registration error:", err);
      return { success: false, message: "Network error occurred." };
    }
  };

  const logout = async () => {
    try {
      const response = await fetchApi("/auth/users/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error logging out:", err);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
