// src/context/AuthContext.jsx
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ loading state add ki
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser || storedUser === "undefined") {
      setLoading(false); // ✅ loading false karo
      return null;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setLoading(false); // ✅ loading false karo
      return parsedUser;
    } catch (err) {
      setLoading(false); // ✅ loading false karo
      return null;
    }
  });

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // ✅ loading bhi provide karo
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);