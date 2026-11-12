import api from './api';

export const adminService = {
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },
  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },
  toggleUserStatus: async (userId, isActive) => {
    return await api.put(`/admin/users/${userId}/status`, { isActive });
  },
  getSchemes: async () => {
    return await api.get('/admin/schemes');
  },
  createScheme: async (schemeData) => {
    return await api.post('/admin/schemes', schemeData);
  },
  updateScheme: async (id, schemeData) => {
    return await api.put(`/admin/schemes/${id}`, schemeData);
  },
  deleteScheme: async (id) => {
    return await api.delete(`/admin/schemes/${id}`);
  },
  getApplications: async (params = {}) => {
    return await api.get('/admin/applications', { params });
  },
  updateApplicationStatus: async (id, status, notes) => {
    return await api.put(`/admin/applications/${id}/status`, { status, notes });
  },
  createCategory: async (categoryData) => {
    return await api.post('/categories', categoryData);
  },
  updateCategory: async (id, categoryData) => {
    return await api.put(`/categories/${id}`, categoryData);
  },
  deleteCategory: async (id) => {
    return await api.delete(`/categories/${id}`);
  }
};
