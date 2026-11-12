import api from './api';

export const schemeService = {
  getSchemes: async (params = {}) => {
    return await api.get('/schemes', { params });
  },
  searchSchemes: async (q, limit = 6) => {
    return await api.get('/schemes/search', { params: { q, limit } });
  },
  getSchemeById: async (idOrSlug) => {
    return await api.get(`/schemes/${idOrSlug}`);
  },
  getStats: async () => {
    return await api.get('/schemes/stats');
  },
  getCategories: async () => {
    return await api.get('/categories');
  },
  getSavedSchemes: async () => {
    return await api.get('/saved-schemes');
  },
  saveScheme: async (schemeId) => {
    return await api.post('/saved-schemes', { schemeId });
  },
  unsaveScheme: async (schemeId) => {
    return await api.delete(`/saved-schemes/${schemeId}`);
  }
};
