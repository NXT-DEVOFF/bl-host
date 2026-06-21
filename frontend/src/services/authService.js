import apiClient from './api';

const authService = {
  register: async (email, password) => {
    return apiClient.post('/auth/register', { email, password });
  },

  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  refreshToken: async () => {
    return apiClient.post('/auth/refresh');
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;
