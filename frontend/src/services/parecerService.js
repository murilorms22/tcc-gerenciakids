import api from './api';

export const parecerService = {
  listar: async (alunoId) => {
    const url = alunoId ? `/pareceres?alunoId=${alunoId}` : '/pareceres';
    const response = await api.get(url);
    return response.data;
  },

  criar: async (parecer) => {
    const response = await api.post('/pareceres', parecer);
    return response.data;
  },

  atualizar: async (id, parecer) => {
    const response = await api.patch(`/pareceres/${id}`, parecer);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/pareceres/${id}`);
    return response.data;
  },
};

export default parecerService;
