import api from './api';

export const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Mark one as read
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Create notification
  createNotification: async (recipientId: string, type: string, content: string) => {
    const response = await api.post('/notifications', {
      recipientId,
      type,
      content
    });
    return response.data;
  }
};