import apiClient from './api';

const serverService = {
  getServers: async () => {
    return apiClient.get('/servers');
  },

  getServerById: async (id) => {
    return apiClient.get(`/servers/${id}`);
  },

  createServer: async (serverData) => {
    return apiClient.post('/servers', serverData);
  },

  updateServer: async (id, serverData) => {
    return apiClient.put(`/servers/${id}`, serverData);
  },

  deleteServer: async (id) => {
    return apiClient.delete(`/servers/${id}`);
  },

  toggleServerStatus: async (id, action) => {
    return apiClient.post(`/servers/${id}/action`, { action });
  },

  getStats: async () => {
    return apiClient.get('/stats');
  },
};

export default serverService;
