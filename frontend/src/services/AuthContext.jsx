import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Configure axios base URL and timeout
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;

console.log('API Base URL:', API_BASE_URL);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If 401 and not already retried and not a refresh request
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;
          
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post('/api/auth/refresh', { refreshToken });
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              
              localStorage.setItem('token', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
              return axios(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              delete axios.defaults.headers.common['Authorization'];
              setUser(null);
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, logout
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token and get user info
      axios.get('/api/auth/me')
        .then(response => {
          setUser(response.data.agent);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, credential, method = 'email') => {
    try {
      console.log('Login attempt:', { identifier, method, baseURL: axios.defaults.baseURL });
      const response = await axios.post('/api/auth/login', { 
        [method]: identifier, 
        ...(method === 'email' ? { password: credential } : { otp: credential }),
        method 
      }, {
        timeout: 10000
      });
      console.log('Login response:', response.data);
      const { accessToken, refreshToken, agent } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(agent);
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      const errorMessage = error.response?.data?.message || error.response?.data?.error;
      
      if (error.code === 'ECONNABORTED') {
        return { success: false, error: 'Connection timeout. Please check your internet.' };
      }
      
      if (error.code === 'ERR_NETWORK') {
        return { success: false, error: 'Cannot connect to server. Check if backend is running.' };
      }
      
      return { 
        success: false, 
        error: errorMessage || 'Unable to sign in. Please check your credentials and try again.' 
      };
    }
  };

  const register = async (name, identifier, password, otp, method = 'email') => {
    try {
      const response = await axios.post('/api/auth/register', { 
        name, 
        [method]: identifier, 
        password, 
        otp, 
        method 
      });
      const { token, agent } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(agent);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message;
      return { 
        success: false, 
        error: errorMessage || 'Unable to create account. Please try again.' 
      };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await axios.post('/api/auth/logout', { refreshToken });
      } catch (error) {
        // Silent fail - still logout locally
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};