import api from './api';

export const eligibilityService = {
  checkEligibility: async (userData) => {
    return await api.post('/eligibility/check', userData);
  },
  getHistory: async () => {
    return await api.get('/eligibility/history');
  },
  getHistoryById: async (id) => {
    return await api.get(`/eligibility/${id}`);
  }
};
