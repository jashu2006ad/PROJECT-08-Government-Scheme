import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('govscheme_token');
    localStorage.removeItem('govscheme_user');
  },
  getMe: async () => {
    return await api.get('/auth/me');
  },
  getProfile: async () => {
    return await api.get('/users/profile');
  },
  updateProfile: async (data) => {
    return await api.put('/users/profile', data);
  },
  changePassword: async (passwords) => {
    return await api.put('/users/change-password', passwords);
  },
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },
  resetPassword: async (payload) => {
    return await api.post('/auth/reset-password', payload);
  },
  getUserActivity: async () => {
    return await api.get('/users/activity');
  }
};
