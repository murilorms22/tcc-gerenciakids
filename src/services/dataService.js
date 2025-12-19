import api from './api';

export const dataService = {
  // Busca alunos via API
  getAlunos: async () => {
    const response = await api.get('/alunos');
    return {
      data: {
        users: response.data
      }
    };
  },

  // Busca aluno por ID via API
  getAlunoById: async (id) => {
    const response = await api.get(`/alunos/${id}`);
    return {
      data: response.data
    };
  },

  // Busca atividades via API
  getAtividades: async () => {
    const response = await api.get('/atividades');
    return {
      data: {
        todos: response.data
      }
    };
  },

  // Atualiza aluno via API
  updateAluno: async (id, data) => {
    const response = await api.put(`/alunos/${id}`, data);
    return {
      data: response.data
    };
  }
};

export default dataService;
