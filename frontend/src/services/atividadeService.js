import api from './api';

export const atividadeService = {
  listar: async (turmaId) => {
    const url = turmaId ? `/atividades?turmaId=${turmaId}` : '/atividades';
    const response = await api.get(url);
    return response.data;
  },

  criar: async (atividade) => {
    const response = await api.post('/atividades', atividade);
    return response.data;
  },

  atualizar: async (id, atividade) => {
    const response = await api.patch(`/atividades/${id}`, atividade);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/atividades/${id}`);
    return response.data;
  },
};

export default atividadeService;

