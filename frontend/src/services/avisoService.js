import api from './api';

export const avisoService = {
  listar: async (turmaId) => {
    const url = turmaId ? `/avisos?turmaId=${turmaId}` : '/avisos';
    const response = await api.get(url);
    return response.data;
  },

  criar: async (aviso) => {
    const response = await api.post('/avisos', aviso);
    return response.data;
  },

  atualizar: async (id, aviso) => {
    const response = await api.patch(`/avisos/${id}`, aviso);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/avisos/${id}`);
    return response.data;
  },
};

export default avisoService;

