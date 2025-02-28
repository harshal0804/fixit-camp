import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import config from "../config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${config.API_URL}/admin/check`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      const response = await fetch(`${config.API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(userData)
      } );
  console.log(response)
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        // You might want to redirect here
        return { success: true };
      } else {
        throw new Error('No user data received');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${config.API_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
