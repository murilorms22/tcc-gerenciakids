import api from './api';

export const responsavelService = {
  listar: async () => {
    const response = await api.get('/responsaveis');
    return response.data;
  },

  listarUsuariosResponsaveis: async () => {
    const response = await api.get('/responsaveis/usuarios');
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/responsaveis/${id}`);
    return response.data;
  },

  criar: async (responsavel) => {
    const response = await api.post('/responsaveis', responsavel);
    return response.data;
  },

  atualizar: async (id, responsavel) => {
    const response = await api.put(`/responsaveis/${id}`, responsavel);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/responsaveis/${id}`);
    return response.data;
  },
};

export default responsavelService;

