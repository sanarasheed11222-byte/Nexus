import api from './api';

export const profileService = {
  getMyProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    bio?: string;
    avatar?: string;
  }) => {
    const response = await api.put('/profile/me', data);
    return response.data;
  },

  getInvestors: async () => {
    const response = await api.get('/profile/investors');
    return response.data;
  },

  getEntrepreneurs: async () => {
    const response = await api.get('/profile/entrepreneurs');
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
