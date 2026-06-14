import api from './api';

export const paymentService = {
  // Get balance
  getBalance: async () => {
    const response = await api.get('/payments/balance');
    return response.data;
  },

  // Get transaction history
  getHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Deposit
  deposit: async (amount: number, description: string) => {
    const response = await api.post('/payments/deposit', {
      amount,
      description
    });
    return response.data;
  },

  // Withdraw
  withdraw: async (amount: number, description: string) => {
    const response = await api.post('/payments/withdraw', {
      amount,
      description
    });
    return response.data;
  },

  // Transfer
  transfer: async (receiverId: string, amount: number, description: string) => {
    const response = await api.post('/payments/transfer', {
      receiverId,
      amount,
      description
    });
    return response.data;
  }
};