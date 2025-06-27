import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      
      console.log('Initializing auth state:', {
        hasAccessToken: !!storedAccessToken,
        hasRefreshToken: !!storedRefreshToken,
        hasUser: !!storedUser
      });
      
      if (storedAccessToken && storedRefreshToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Restoring auth state:', {
            userId: parsedUser.id,
            username: parsedUser.username
          });
          
          // Set the token in the API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
          
          // Update state
          setAccessToken(storedAccessToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error restoring auth state:', error);
          // Clear invalid data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setAccessToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newAccessToken: string, newRefreshToken: string, newUser: User) => {
    console.log('Logging in user:', {
      userId: newUser.id,
      username: newUser.username
    });
    
    // Set the token in the API headers
    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    
    // Update state
    setAccessToken(newAccessToken);
    setUser(newUser);
    
    // Store in localStorage
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updateUser = (updatedUser: User) => {
    console.log('Updating user:', {
      userId: updatedUser.id,
      username: updatedUser.username
    });
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    console.log('Logging out user');
    
    // Clear state
    setAccessToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    // Navigate to login
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 