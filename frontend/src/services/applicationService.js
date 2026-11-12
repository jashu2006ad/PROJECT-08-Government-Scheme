import api from './api';

export const applicationService = {
  getApplications: async () => {
    return await api.get('/applications');
  },
  getApplicationById: async (id) => {
    return await api.get(`/applications/${id}`);
  },
  createApplication: async (data) => {
    return await api.post('/applications', data);
  },
  updateApplication: async (id, data) => {
    return await api.put(`/applications/${id}`, data);
  },
  deleteApplication: async (id) => {
    return await api.delete(`/applications/${id}`);
  },
  getDocumentChecklist: async (schemeId) => {
    return await api.get(`/documents/${schemeId}`);
  },
  updateDocumentChecklist: async (schemeId, documents) => {
    return await api.put(`/documents/${schemeId}`, { documents });
  }
};
