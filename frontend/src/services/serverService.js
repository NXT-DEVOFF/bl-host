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

  getServerStatus: async (id) => {
    return apiClient.get(`/servers/${id}/status`);
  },

  getServerLogs: async (id, tail = 200) => {
    return apiClient.get(`/servers/${id}/logs?tail=${tail}`);
  },

  getStats: async () => {
    return apiClient.get('/stats');
  },
};

export default serverService;
