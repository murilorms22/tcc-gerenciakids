import api from './api';

export const auditService = {
  listar: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
};

export default auditService;

