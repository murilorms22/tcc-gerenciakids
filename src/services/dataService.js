import dbData from '../db.json';

export const dataService = {
  getAlunos: () => {
    return Promise.resolve({
      data: {
        users: dbData.alunos
      }
    });
  },

  getAlunoById: (id) => {
    const aluno = dbData.alunos.find(u => u.id === id || u.id === parseInt(id));
    if (!aluno) {
      return Promise.reject(new Error('Aluno não encontrado'));
    }
    return Promise.resolve({
      data: aluno
    });
  },

  getAtividades: () => {
    return Promise.resolve({
      data: {
        todos: dbData.atividades
      }
    });
  },

  updateAluno: (id, data) => {
    const index = dbData.alunos.findIndex(u => u.id === id || u.id === parseInt(id));
    if (index === -1) {
      return Promise.reject(new Error('Aluno não encontrado'));
    }
    dbData.alunos[index] = { ...dbData.alunos[index], ...data };
    return Promise.resolve({
      data: dbData.alunos[index]
    });
  },

  autenticar: (username, password) => {
    const usuario = dbData.usuarios.find(u => u.username === username && u.password === password);
    if (!usuario) {
      return Promise.reject(new Error('Usuário ou senha inválidos'));
    }
    return Promise.resolve({
      data: {
        accessToken: 'mock-token-' + usuario.id,
        id: usuario.id,
        firstName: usuario.firstName,
        lastName: usuario.lastName,
        email: usuario.email,
        role: usuario.role
      }
    });
  }
};

export default dataService;
