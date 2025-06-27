import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, ProfileCompletionData, User } from '../types';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/refresh-token', { refreshToken });
    return response.data;
  },

  async completeProfile(data: ProfileCompletionData): Promise<AuthResponse> {
    const response = await api.post('/api/auth/complete-profile', data);
    return response.data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      console.log('Updating profile:', { userId, updates });
      
      // Create FormData if profileLogo is present
      let data;
      if (updates.profileLogo) {
        data = new FormData();
        data.append('profileLogo', updates.profileLogo);
        // Add other fields if they exist
        if (updates.firstName) data.append('firstName', updates.firstName);
        if (updates.lastName) data.append('lastName', updates.lastName);
        if (updates.username) data.append('username', updates.username);
      } else {
        data = updates;
      }

      const response = await api.put(`/api/auth/profile`, data);
      console.log('Profile update response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      return response.data.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
};

export default authService; 