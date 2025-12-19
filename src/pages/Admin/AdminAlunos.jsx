import { useState, useEffect, useRef } from 'react';
import { alunoService } from '../../services/alunoService';
import { faPlus, faTrash, faPen, faSync, faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function AdminAlunos() {
  const location = useLocation();
  const [alunos, setAlunos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    alergias: 'Nenhuma',
    temAlergia: false,
    alergiasTexto: '',
    foto_perfil_url: ''
  });

  // Preview da imagem selecionada
  const [previewImagem, setPreviewImagem] = useState('');

  useEffect(() => {
    carregarAlunos();
  }, [location]);

  const carregarAlunos = async () => {
    try {
      setCarregando(true);
      // Carrega todos os alunos (sem filtro de turma)
      const dados = await alunoService.listar();
      setAlunos(dados);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar alunos');
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Converte arquivo de imagem para base64
   * @param {File} file 
   * @returns {Promise<string>}
   */
  const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        reject(new Error('Por favor, selecione uma imagem válida.'));
        return;
      }

      // Validar tamanho (máximo 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        reject(new Error('A imagem deve ter no máximo 2MB.'));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Handler para seleção de imagem
   */
  const handleImagemChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await converterParaBase64(file);
      setPreviewImagem(base64);
      setFormData({ ...formData, foto_perfil_url: base64 });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNovoAluno = () => {
    setAlunoEditando('novo');
    setFormData({
      nome_completo: '',
      alergias: 'Nenhuma',
      temAlergia: false,
      alergiasTexto: '',
      foto_perfil_url: ''
    });
    setPreviewImagem('');
    setModalAberto(true);
  };

  const handleEditarAluno = (aluno) => {
    const temAlergia = aluno.alergias !== 'Nenhuma';
    setAlunoEditando(aluno.id);
    setFormData({
      nome_completo: aluno.nome_completo,
      alergias: aluno.alergias,
      temAlergia: temAlergia,
      alergiasTexto: temAlergia ? aluno.alergias : '',
      foto_perfil_url: aluno.foto_perfil_url || ''
    });
    setPreviewImagem(aluno.foto_perfil_url || '');
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAlunoEditando(null);
    setFormData({
      nome_completo: '',
      alergias: 'Nenhuma',
      temAlergia: false,
      alergiasTexto: '',
      foto_perfil_url: ''
    });
    setPreviewImagem('');
  };

  const handleSalvar = async () => {
    // Validação do formulário
    if (!formData.nome_completo.trim()) {
      alert('Por favor, preencha o nome do aluno.');
      return;
    }

    if (formData.temAlergia && !formData.alergiasTexto.trim()) {
      alert('Por favor, especifique a(s) alergia(s).');
      return;
    }

    const alergiasValue = formData.temAlergia ? formData.alergiasTexto : 'Nenhuma';

    setSalvando(true);

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
          faltas: 0,
          foto_perfil_url: formData.foto_perfil_url
        };
        const alunoSalvo = await alunoService.criar(novoAluno);
        setAlunos([...alunos, alunoSalvo]);
        alert('Aluno cadastrado com sucesso!');
      } else {
        const alunoAtualizado = {
          ...alunos.find(a => a.id === alunoEditando),
          nome_completo: formData.nome_completo,
          alergias: alergiasValue,
          foto_perfil_url: formData.foto_perfil_url
        };
        await alunoService.atualizar(alunoEditando, alunoAtualizado);
        setAlunos(alunos.map(a => a.id === alunoEditando ? alunoAtualizado : a));
        alert('Aluno atualizado com sucesso!');
      }
      handleFecharModal();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      alert('Erro ao salvar aluno: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await alunoService.deletar(id);
        setAlunos(alunos.filter(a => a.id !== id));
        alert('Aluno excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir aluno.');
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-(--azul-escuro) mb-6">Secretaria: Gestão de Alunos</h1>

        {/* Botões de ação */}
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
            <FontAwesomeIcon icon={faSync} className={carregando ? 'animate-spin' : ''} /> 
            {carregando ? 'Carregando...' : 'Recarregar'}
          </button>
        </div>

        {/* Tabela de alunos */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-(--bg-gray-light)">
              <tr className="border-b border-(--border-gray)">
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">Foto</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">Alergias</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-(--text-gray)">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id} className="border-b border-(--border-light) last:border-b-0 hover:bg-(--bg-gray-light) transition-colors">
                  <td className="px-6 py-4">
                    <img 
                      src={aluno.foto_perfil_url || 'https://via.placeholder.com/40'} 
                      alt={aluno.nome_completo}
                      className="w-10 h-10 rounded-full object-cover border-2 border-(--border-gray)"
                    />
                  </td>
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
      </div>

      {/* Modal de Cadastro/Edição usando createPortal */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title={alunoEditando === 'novo' ? 'Cadastrar Novo Aluno' : 'Editar Aluno'}
      >
        <div className="space-y-6">
          {/* Upload de Foto */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-(--border-gray) bg-(--bg-gray-light)">
                {previewImagem ? (
                  <img 
                    src={previewImagem} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-(--text-gray)">
                    <FontAwesomeIcon icon={faCamera} size="2x" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-(--orange) text-white p-2 rounded-full hover:bg-(--dark-orange) transition-colors"
                title="Selecionar foto"
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImagemChange}
              className="hidden"
            />
            <p className="text-sm text-(--text-gray) mt-2">Clique para adicionar foto (máx. 2MB)</p>
          </div>

          {/* Nome Completo */}
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-(--azul-escuro) mb-2">
              Nome Completo *
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

          {/* Alergias */}
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
                  className="w-4 h-4 text-(--orange) cursor-pointer"
                />
                <label htmlFor="alergia-nao" className="ml-2 cursor-pointer text-(--azul-escuro) font-medium">
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
                  className="w-4 h-4 text-(--orange) cursor-pointer"
                />
                <label htmlFor="alergia-sim" className="ml-2 cursor-pointer text-(--azul-escuro) font-medium">
                  Sim
                </label>
              </div>
            </div>
          </fieldset>

          {formData.temAlergia && (
            <div>
              <label htmlFor="alergia-texto" className="block text-sm font-semibold text-(--azul-escuro) mb-2">
                Especifique a(s) alergia(s) *
              </label>
              <textarea
                id="alergia-texto"
                value={formData.alergiasTexto}
                onChange={(e) => setFormData({ ...formData, alergiasTexto: e.target.value })}
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange) resize-none"
                placeholder="Digite a(s) alergia(s) do aluno"
                rows="3"
              />
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-(--dark-orange) disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={handleFecharModal}
              disabled={salvando}
              className="flex-1 bg-(--border-gray) text-(--azul-escuro) py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-(--border-light) disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}