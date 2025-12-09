import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alunoService } from '../../services/alunoService';
import { faPlus, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function AdminAlunos() {
  const [alunos, setAlunos] = useState([]);
  
  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    const dados = await alunoService.listar(202); 
    setAlunos(dados);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      await alunoService.deletar(id);
      carregarAlunos();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Secretaria: Gestão de Alunos</h1>
        <Link 
          to="/admin/alunos/novo" 
          className="bg-laranja-principal hover:bg-laranja-escuro text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} /> Novo Aluno
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alergias</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alunos.map((aluno) => (
              <tr key={aluno.id}>
                <td className="px-6 py-4 whitespace-nowrap">{aluno.nome_completo}</td>
                <td className="px-6 py-4">
                  {aluno.alergias !== "Nenhuma" ? (
                    <span className="text-red-600 font-semibold text-sm bg-red-50 px-2 py-1 rounded">
                      {aluno.alergias}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Nenhuma</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    to={`/admin/alunos/editar/${aluno.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(aluno.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Excluir"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}