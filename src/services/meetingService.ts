import api from './api';

export const meetingService = {
  // Get all my meetings
  getMeetings: async () => {
    const response = await api.get('/meetings');
    return response.data;
  },

  // Create a meeting
  createMeeting: async (data: {
    title: string;
    participant: string;
    date: string;
    duration: number;
    notes: string;
  }) => {
    const response = await api.post('/meetings', data);
    return response.data;
  },

  // Accept meeting
  acceptMeeting: async (id: string) => {
    const response = await api.put(`/meetings/${id}/accept`);
    return response.data;
  },

  // Reject meeting
  rejectMeeting: async (id: string) => {
    const response = await api.put(`/meetings/${id}/reject`);
    return response.data;
  },

  // Cancel meeting
  cancelMeeting: async (id: string) => {
    const response = await api.put(`/meetings/${id}/cancel`);
    return response.data;
  }
};