import api from './api';

export const alunoService = {
  listar: async (turmaId) => {
    const url = turmaId ? `/alunos?turmaId=${turmaId}` : '/alunos';
    const response = await api.get(url);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/alunos/${id}`);
    return response.data;
  },

  criar: async (aluno) => {
    const response = await api.post('/alunos', aluno);
    return response.data;
  },

  atualizar: async (id, aluno) => {
    const response = await api.put(`/alunos/${id}`, aluno);
    return response.data;
  },

  registrarChamada: async (id, payload = { incrementar: true }) => {
    const response = await api.patch(`/alunos/${id}/chamada`, payload);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/alunos/${id}`);
    return response.data;
  },
};

export default alunoService;
