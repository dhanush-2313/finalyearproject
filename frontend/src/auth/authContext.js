"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { ethers } from 'ethers';

// Create auth context
export const AuthContext = createContext(null);

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  // Add isAuthenticated computed property
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Handle wallet connection
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      setWalletAddress(address);
      
      // Update user's wallet address in the database
      if (user) {
        try {
          const response = await axios.put('/api/users/update-wallet', {
            walletAddress: address
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (response.data.success) {
            setUser(prevUser => ({
              ...prevUser,
              walletAddress: address
            }));
          }
        } catch (err) {
          console.error('Error updating wallet address:', err);
        }
      }
      
      return address;
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', credentials);
      
      // Check if MFA verification is required
      if (response.data.requireMFA) {
        return { 
          requireMFA: true, 
          userId: response.data.userId,
          message: response.data.message
        };
      }
      
      // Normal login flow if MFA is not required
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call the backend logout endpoint
        await axios.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if the API call fails
    } finally {
      // Always clear local state
      localStorage.removeItem('token');
      setUser(null);
      setWalletAddress(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    walletAddress,
    connectWallet,
    register,
    login,
    logout
  };

  if (loading) {
    return <Loader message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
