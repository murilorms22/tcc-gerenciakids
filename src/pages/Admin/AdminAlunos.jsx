import { useState, useEffect } from 'react';
import { alunoService } from '../../services/alunoService';
import { faPlus, faTrash, faPen, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminAlunos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [alunos, setAlunos] = useState([]);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    alergias: 'Nenhuma',
    temAlergia: false,
    alergiasTexto: ''
  });

  useEffect(() => {
    carregarAlunos();
  }, [location]); // Recarregar sempre que a rota mudar

  const carregarAlunos = async () => {
    try {
      setCarregando(true);
      const dados = await alunoService.listar(202);
      setAlunos(dados);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar alunos');
    } finally {
      setCarregando(false);
    }
  };

  const handleNovoAluno = () => {
    setAlunoEditando('novo');
    setFormData({
      nome_completo: '',
      alergias: 'Nenhuma',
      temAlergia: false,
      alergiasTexto: ''
    });
  };

  const handleEditarAluno = (aluno) => {
    const temAlergia = aluno.alergias !== 'Nenhuma';
    setAlunoEditando(aluno.id);
    setFormData({
      nome_completo: aluno.nome_completo,
      alergias: aluno.alergias,
      temAlergia: temAlergia,
      alergiasTexto: temAlergia ? aluno.alergias : ''
    });
  };

  const handleCancelar = () => {
    setAlunoEditando(null);
    setFormData({
      nome_completo: '',
      alergias: 'Nenhuma',
      temAlergia: false,
      alergiasTexto: ''
    });
  };

  const handleSalvar = async () => {
    if (!formData.nome_completo.trim()) {
      alert('Por favor, preencha o nome do aluno.');
      return;
    }

    const alergiasValue = formData.temAlergia ? formData.alergiasTexto : 'Nenhuma';

    try {
      if (alunoEditando === 'novo') {
        const novoAluno = {
          id_turma: 202,
          nome_completo: formData.nome_completo,
          firstName: formData.nome_completo.split(' ')[0],
          lastName: formData.nome_completo.split(' ').slice(1).join(' '),
          alergias: alergiasValue,
          observacoes: '',
          responsaveis_ids: [],
          faltas: 0
        };
        // Salvar no banco de dados
        const alunoSalvo = await alunoService.criar(novoAluno);
        // Adicionar ao estado com o ID gerado pelo servidor
        setAlunos([...alunos, alunoSalvo]);
      } else {
        const alunoAtualizado = {
          ...alunos.find(a => a.id === alunoEditando),
          nome_completo: formData.nome_completo,
          alergias: alergiasValue
        };
        await alunoService.atualizar(alunoEditando, alunoAtualizado);
        setAlunos(alunos.map(a => a.id === alunoEditando ? alunoAtualizado : a));
      }
      handleCancelar();
      alert('Aluno salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      alert('Erro ao salvar aluno: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      await alunoService.deletar(id);
      setAlunos(alunos.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">

        <h1 className="text-4xl font-bold text-(--azul-escuro) mb-6">Secretaria: Gestão de Alunos</h1>

        {alunoEditando ? (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-8">
            <h2 className="text-2xl font-bold text-(--azul-escuro) mb-6">
              {alunoEditando === 'novo' ? 'Novo Aluno' : 'Editar Aluno'}
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-semibold text-(--azul-escuro) mb-2">
                  Nome Completo
                </label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
                  placeholder="Digite o nome completo do aluno"
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-semibold text-(--azul-escuro) mb-3">
                  Possui Alergias?
                </legend>
                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="alergia-nao"
                      name="alergia"
                      checked={!formData.temAlergia}
                      onChange={() => setFormData({ ...formData, temAlergia: false, alergiasTexto: '' })}
                      className="custom-checkbox mr-2"
                    />
                    <label htmlFor="alergia-nao" className="cursor-pointer text-(--azul-escuro) font-medium">
                      Não
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="alergia-sim"
                      name="alergia"
                      checked={formData.temAlergia}
                      onChange={() => setFormData({ ...formData, temAlergia: true })}
                      className="custom-checkbox mr-2"
                    />
                    <label htmlFor="alergia-sim" className="cursor-pointer text-(--azul-escuro) font-medium">
                      Sim
                    </label>
                  </div>
                </div>
              </fieldset>

              {formData.temAlergia && (
                <div>
                  <label htmlFor="alergia-texto" className="block text-sm font-semibold text-(--azul-escuro) mb-2">
                    Especifique a(s) alergia(s)
                  </label>
                  <textarea
                    id="alergia-texto"
                    value={formData.alergiasTexto}
                    onChange={(e) => setFormData({ ...formData, alergiasTexto: e.target.value })}
                    className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
                    placeholder="Digite a(s) alergia(s) do aluno"
                    rows="4"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSalvar}
                className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-(--dark-orange)"
              >
                Salvar
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 bg-(--border-gray) text-(--azul-escuro) py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-(--border-light)"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleNovoAluno}
                className="bg-(--orange) text-white px-6 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--dark-orange)"
              >
                <FontAwesomeIcon icon={faPlus} /> Novo Aluno
              </button>
              <button
                onClick={carregarAlunos}
                disabled={carregando}
                className="bg-(--azul-escuro) text-white px-6 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--azul-claro) disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSync} /> {carregando ? 'Carregando...' : 'Recarregar'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-(--bg-gray-light)">
                  <tr className="border-b border-(--border-gray)">
                    <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">Alergias</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-(--text-gray)">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr key={aluno.id} className="border-b border-(--border-light) last:border-b-0 hover:bg-(--bg-gray-light) transition-colors">
                      <td className="px-6 py-4 text-(--azul-escuro) font-semibold">{aluno.nome_completo}</td>
                      <td className="px-6 py-4">
                        {aluno.alergias !== 'Nenhuma' ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                            {aluno.alergias}
                          </span>
                        ) : (
                          <span className="text-(--text-gray) text-sm">Nenhuma</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        <button
                          onClick={() => handleEditarAluno(aluno)}
                          className="text-(--orange) hover:text-(--dark-orange) font-semibold transition-colors"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          onClick={() => handleDelete(aluno.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                          title="Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alunos.length === 0 && (
                <div className="p-8 text-center text-(--text-gray)">
                  Nenhum aluno cadastrado. Clique em "Novo Aluno" para adicionar um.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}