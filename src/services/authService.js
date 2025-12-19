import api from './api';

export const authService = {
  /**
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise}
   */
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response;
  },

  /**
   * @param {object} userData
   * @returns {Promise}
   */
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response;
  },

  /**
   * Busca dados do usuário logado
   * @param {number} userId 
   * @returns {Promise}
   */
  getUsuario: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response;
  }
};

export default authService;
