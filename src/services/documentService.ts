import api from './api';

export const documentService = {
  // Get all documents
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File, title: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Sign document
  signDocument: async (id: string, signature: string) => {
    const response = await api.put(`/documents/${id}/sign`, { signature });
    return response.data;
  },

  // Share document
  shareDocument: async (id: string, userId: string) => {
    const response = await api.put(`/documents/${id}/share`, { userId });
    return response.data;
  },

  // Delete document
  deleteDocument: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};