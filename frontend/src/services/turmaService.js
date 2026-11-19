import api from './api';

export const turmaService = {
  listar: async () => {
    const response = await api.get('/turmas');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/turmas/${id}`);
    return response.data;
  },

  criar: async (turma) => {
    const response = await api.post('/turmas', turma);
    return response.data;
  },

  atualizar: async (id, turma) => {
    const response = await api.put(`/turmas/${id}`, turma);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/turmas/${id}`);
    return response.data;
  },
};

export default turmaService;

