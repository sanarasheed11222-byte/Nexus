import api from './api';

export const messageService = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

  // Get conversation with specific user
  getMessages: async (userId: string) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  // Send message
  sendMessage: async (receiverId: string, content: string) => {
    const response = await api.post('/messages', {
      receiverId,
      content
    });
    return response.data;
  },

  // Mark as read
  markAsRead: async (userId: string) => {
    const response = await api.put(`/messages/${userId}/read`);
    return response.data;
  }
};