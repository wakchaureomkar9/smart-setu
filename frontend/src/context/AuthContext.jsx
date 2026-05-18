import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Logged in successfully!');
      return { success: true, user: res.data.user };
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.message || data?.errors?.[0]?.msg || 'Login failed';
      toast.error(msg);
      return { success: false, user: null };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.message || data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
