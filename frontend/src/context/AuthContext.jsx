import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (tokenVal, userData) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token;
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedIn, isAdmin, isInstructor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  // Return safe defaults if used outside AuthProvider (e.g. during SSR or test)
  if (!ctx) return { user: null, token: null, loading: false, login: () => {}, logout: () => {}, isLoggedIn: false, isAdmin: false, isInstructor: false };
  return ctx;
};
