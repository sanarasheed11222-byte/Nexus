import api from './api';

export const profileService = {
  // Get my profile
  getMyProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  // Update my profile
  updateProfile: async (data: {
    name?: string;
    bio?: string;
    avatar?: string;
  }) => {
    const response = await api.put('/profile/me', data);
    return response.data;
  },

  // Get all investors
  getInvestors: async () => {
    const response = await api.get('/profile/investors');
    return response.data;
  },

  // Get all entrepreneurs
  getEntrepreneurs: async () => {
    const response = await api.get('/profile/entrepreneurs');
    return response.data;
  }
};