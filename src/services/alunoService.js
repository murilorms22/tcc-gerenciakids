import api from './api';

export const alunoService = {
  listar: async (idTurma) => {
    const url = idTurma ? `/alunos?id_turma=${idTurma}` : '/alunos';
    const response = await api.get(url);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/alunos/${id}`);
    return response.data;
  },

  criar: async (aluno) => {
    console.log('Criando aluno com dados:', aluno);
    try {
      const response = await api.post('/alunos', aluno);
      console.log('Aluno criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro na requisição POST:', error.response?.data || error.message);
      throw error;
    }
  },

  atualizar: async (id, aluno) => {
    const response = await api.put(`/alunos/${id}`, aluno);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/alunos/${id}`);
    return response.data;
  }
};