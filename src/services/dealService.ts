import api from './api';

export const dealService = {
  // Get all deals
  getDeals: async () => {
    const response = await api.get('/deals');
    return response.data;
  },

  // Create deal
  createDeal: async (data: {
    entrepreneurId: string;
    startupName: string;
    industry: string;
    amount: number;
    equity: number;
    status: string;
    stage: string;
    notes: string;
  }) => {
    const response = await api.post('/deals', data);
    return response.data;
  },

  // Update deal
  updateDeal: async (id: string, data: any) => {
    const response = await api.put(`/deals/${id}`, data);
    return response.data;
  },

  // Delete deal
  deleteDeal: async (id: string) => {
    const response = await api.delete(`/deals/${id}`);
    return response.data;
  }
};