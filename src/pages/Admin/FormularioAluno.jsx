import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { alunoService } from '../../services/alunoService';

export default function FormularioAluno() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    data_nascimento: '',
    alergias: 'Nenhuma',
    observacoes: '',
    id_turma: 202,
    faltas: 0
  });

  useEffect(() => {
    if (id) {
      alunoService.buscarPorId(id).then(dados => setFormData(dados));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await alunoService.atualizar(id, formData);
    } else {
      await alunoService.criar(formData);
    }
    navigate('/admin/alunos');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {id ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input 
            type="text" 
            name="nome_completo" 
            value={formData.nome_completo} 
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
          <input 
            type="date" 
            name="data_nascimento" 
            value={formData.data_nascimento} 
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Alergias</label>
          <input 
            type="text" 
            name="alergias" 
            value={formData.alergias} 
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            placeholder="Ex: Nenhuma, Lactose, Poeira..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea 
            name="observacoes" 
            value={formData.observacoes} 
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="flex-1 bg-laranja-principal text-white py-2 rounded hover:bg-laranja-escuro transition"
          >
            Salvar
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/admin/alunos')}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}