import React, { useState, useEffect, useRef } from 'react';
import { alunoService } from '../../services/alunoService';
import turmaService from '../../services/turmaService';
import responsavelService from '../../services/responsavelService';
import {
  faPlus,
  faTrash,
  faPen,
  faSync,
  faCamera,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function AdminAlunos() {
  const location = useLocation();
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const fileInputRef = useRef(null);

  const estadoInicialForm = {
    nome: '',
    data_nascimento: '',
    genero: 'Feminino',
    endereco: '',
    turmaId: '',
    responsavelId: '',
    tipo_sanguineo: 'O+',
    peso: '',
    altura: '',
    alergias: 'Nenhuma',
    temAlergia: false,
    alergiasTexto: '',
    observacoes: '',
    foto_perfil_url: '',
  };

  const [formData, setFormData] = useState(estadoInicialForm);
  const [previewImagem, setPreviewImagem] = useState('');

  const formatarDataParaExibicao = (dataISO) => {
    if (!dataISO) return '';
    const partes = dataISO.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataISO;
  };

  const formatarDataParaISO = (dataExibicao) => {
    if (!dataExibicao) return '';
    const partes = dataExibicao.split('/');
    if (
      partes.length === 3 &&
      partes[0].length === 2 &&
      partes[1].length === 2 &&
      partes[2].length === 4
    ) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return '';
  };

  const aplicarMascaraData = (valor) => {
    let numeros = valor.replace(/\D/g, '').substring(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) {
      return `${numeros.substring(0, 2)}/${numeros.substring(2)}`;
    }
    return `${numeros.substring(0, 2)}/${numeros.substring(2, 4)}/${numeros.substring(4)}`;
  };

  const validarData = (data) => {
    if (!data || data.length !== 10) return false;
    const partes = data.split('/');
    if (partes.length !== 3) return false;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    if (ano < 1900 || ano > new Date().getFullYear()) return false;

    const dataObj = new Date(ano, mes - 1, dia);
    return (
      dataObj.getDate() === dia &&
      dataObj.getMonth() === mes - 1 &&
      dataObj.getFullYear() === ano
    );
  };

  useEffect(() => {
    carregarDados();
  }, [location]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [alunosData, turmasData, respData] = await Promise.all([
        alunoService.listar(),
        turmaService.listar(),
        responsavelService.listar(),
      ]);

      setAlunos(Array.isArray(alunosData) ? alunosData : []);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);
      setResponsaveis(Array.isArray(respData) ? respData : []);
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Por favor, selecione uma imagem válida.'));
        return;
      }
      const maxSize = 2 * 1024 * 1024;
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

  const handleImagemChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await converterParaBase64(file);
      setPreviewImagem(base64);
      setFormData({ ...formData, foto_perfil_url: base64 });
    } catch (error) {
      setErroForm(error.message);
    }
  };

  const handleNovoAluno = () => {
    setAlunoEditando('novo');
    setErroForm('');
    setFormData({
      ...estadoInicialForm,
      turmaId: turmas[0]?.id || '',
      responsavelId: responsaveis[0]?.id || '',
    });
    setPreviewImagem('');
    setModalAberto(true);
  };

  const handleEditarAluno = (aluno) => {
    const nome = aluno.nome || aluno.nome_completo || '';
    const alergiasAtuais = aluno.alergias || 'Nenhuma';
    const temAlergia =
      Boolean(alergiasAtuais) && alergiasAtuais.toLowerCase() !== 'nenhuma';

    setAlunoEditando(aluno.id);
    setErroForm('');
    setFormData({
      nome,
      data_nascimento: formatarDataParaExibicao(aluno.data_nascimento),
      genero: aluno.genero || 'Feminino',
      endereco: aluno.endereco || '',
      turmaId: aluno.turmaId || turmas[0]?.id || '',
      responsavelId: aluno.responsavelId || responsaveis[0]?.id || '',
      tipo_sanguineo: aluno.tipo_sanguineo || 'O+',
      peso: aluno.peso ?? '',
      altura: aluno.altura ?? '',
      alergias: alergiasAtuais,
      temAlergia,
      alergiasTexto: temAlergia ? alergiasAtuais : '',
      observacoes: aluno.observacoes || '',
      foto_perfil_url: aluno.foto_perfil_url || '',
    });
    setPreviewImagem(aluno.foto_perfil_url || '');
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAlunoEditando(null);
    setErroForm('');
    setFormData(estadoInicialForm);
    setPreviewImagem('');
  };

  const handleSalvar = async () => {
    setErroForm('');

    if (!formData.nome.trim()) {
      setErroForm('Por favor, preencha o nome completo do aluno.');
      return;
    }

    if (
      !formData.data_nascimento ||
      !validarData(formData.data_nascimento)
    ) {
      setErroForm('Por favor, preencha uma data de nascimento válida (dd/mm/aaaa).');
      return;
    }

    if (!formData.turmaId || !formData.responsavelId) {
      setErroForm('Selecione a Turma e o Responsável Legal do aluno.');
      return;
    }

    if (formData.temAlergia && !formData.alergiasTexto.trim()) {
      setErroForm('Por favor, especifique a(s) alergia(s) do aluno.');
      return;
    }

    const alergiasValue = formData.temAlergia
      ? formData.alergiasTexto.trim()
      : 'Nenhuma';
    const dataNascimentoISO = formatarDataParaISO(formData.data_nascimento);

    const payload = {
      nome: formData.nome.trim(),
      data_nascimento: dataNascimentoISO,
      genero: formData.genero || null,
      endereco: formData.endereco.trim() || null,
      turmaId: Number(formData.turmaId),
      responsavelId: Number(formData.responsavelId),
      tipo_sanguineo: formData.tipo_sanguineo || null,
      peso: formData.peso !== '' ? Number(formData.peso) : null,
      altura: formData.altura !== '' ? Number(formData.altura) : null,
      alergias: alergiasValue,
      observacoes: formData.observacoes.trim() || '',
      foto_perfil_url: formData.foto_perfil_url || null,
    };

    setSalvando(true);
    try {
      if (alunoEditando === 'novo') {
        const alunoSalvo = await alunoService.criar(payload);
        setAlunos([...alunos, alunoSalvo]);
      } else {
        const alunoAtualizado = await alunoService.atualizar(
          alunoEditando,
          payload,
        );
        setAlunos(
          alunos.map((a) => (a.id === alunoEditando ? alunoAtualizado : a)),
        );
      }
      handleFecharModal();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      const msg = error.response?.data?.message || error.message;
      setErroForm(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await alunoService.deletar(id);
        setAlunos(alunos.filter((a) => a.id !== id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert(
          error.response?.data?.message || 'Erro ao excluir aluno.',
        );
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-(--azul-escuro)">
              Secretaria: Gestão de Alunos e Fichas Médicas
            </h1>
            <p className="text-sm text-(--text-gray) mt-1 flex items-center gap-2">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-(--orange)"
              />
              Campos médicos sensíveis são criptografados automaticamente com
              AES-256-GCM no MySQL.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleNovoAluno}
            className="bg-(--orange) text-white px-6 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--dark-orange) border-none"
          >
            <FontAwesomeIcon icon={faPlus} /> Novo Aluno
          </button>
          <button
            onClick={carregarDados}
            disabled={carregando}
            className="bg-(--azul-escuro) text-white px-6 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--azul-claro) disabled:opacity-50 border-none"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={carregando ? 'animate-spin' : ''}
            />
            {carregando ? 'Carregando...' : 'Recarregar'}
          </button>
        </div>

        {/* Tabela de alunos */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-(--bg-gray-light)">
              <tr className="border-b border-(--border-gray)">
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Foto
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Turma / Responsável
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Sangue / Alergias
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-(--text-gray)">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => {
                const nome = aluno.nome || aluno.nome_completo || 'Aluno';
                const alergias = aluno.alergias || 'Nenhuma';
                return (
                  <tr
                    key={aluno.id}
                    className="border-b border-(--border-light) last:border-b-0 hover:bg-(--bg-gray-light) transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={
                          aluno.foto_perfil_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ff7417&color=fff`
                        }
                        alt={nome}
                        className="w-10 h-10 rounded-full object-cover border-2 border-(--border-gray)"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-(--azul-escuro) font-semibold m-0">
                        {nome}
                      </p>
                      <p className="text-xs text-(--text-gray) m-0">
                        Nasc: {formatarDataParaExibicao(aluno.data_nascimento)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-semibold text-(--azul-escuro) m-0">
                        {aluno.turma?.nome || `Turma #${aluno.turmaId}`}
                      </p>
                      <p className="text-xs text-(--text-gray) m-0">
                        Resp: {aluno.responsavel?.nome || `#${aluno.responsavelId}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {aluno.tipo_sanguineo && (
                          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {aluno.tipo_sanguineo}
                          </span>
                        )}
                        {alergias !== 'Nenhuma' ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold">
                            {alergias}
                          </span>
                        ) : (
                          <span className="text-(--text-gray) text-sm">
                            Sem alergias
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => handleEditarAluno(aluno)}
                        className="text-(--orange) hover:text-(--dark-orange) font-semibold transition-colors bg-transparent border-none cursor-pointer"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        onClick={() => handleDelete(aluno.id)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors bg-transparent border-none cursor-pointer"
                        title="Excluir"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {alunos.length === 0 && (
            <div className="p-8 text-center text-(--text-gray)">
              Nenhum aluno cadastrado. Clique em &quot;Novo Aluno&quot; para
              adicionar um.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição Completa */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title={
          alunoEditando === 'novo'
            ? 'Cadastrar Novo Aluno e Ficha Médica'
            : 'Editar Aluno e Ficha Médica'
        }
      >
        <div className="space-y-5">
          {erroForm && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              {erroForm}
            </div>
          )}

          {/* Upload de Foto */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-(--border-gray) bg-(--bg-gray-light)">
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
                className="absolute bottom-0 right-0 bg-(--orange) text-white p-2 rounded-full hover:bg-(--dark-orange) transition-colors border-none cursor-pointer"
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
            <p className="text-xs text-(--text-gray) mt-2">
              Clique para adicionar foto (máx. 2MB)
            </p>
          </div>

          {/* Nome Completo */}
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-semibold text-(--azul-escuro) mb-1"
            >
              Nome Completo *
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              placeholder="Digite o nome completo do aluno"
            />
          </div>

          {/* Data de Nascimento e Gênero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="data_nascimento"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Data de Nascimento *
              </label>
              <input
                id="data_nascimento"
                type="text"
                value={formData.data_nascimento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    data_nascimento: aplicarMascaraData(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
                placeholder="dd/mm/aaaa"
                maxLength={10}
              />
            </div>

            <div>
              <label
                htmlFor="genero"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Gênero
              </label>
              <select
                id="genero"
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Turma e Responsável Legal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="turmaId"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Turma *
              </label>
              <select
                id="turmaId"
                value={formData.turmaId}
                onChange={(e) =>
                  setFormData({ ...formData, turmaId: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="">Selecione a turma...</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.turno})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="responsavelId"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Responsável Legal *
              </label>
              <select
                id="responsavelId"
                value={formData.responsavelId}
                onChange={(e) =>
                  setFormData({ ...formData, responsavelId: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="">Selecione o responsável...</option>
                {responsaveis.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome} ({r.cpf})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Endereço Residencial */}
          <div>
            <label
              htmlFor="endereco"
              className="block text-sm font-semibold text-(--azul-escuro) mb-1"
            >
              Endereço Residencial
            </label>
            <input
              id="endereco"
              type="text"
              value={formData.endereco}
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
              }
              placeholder="Rua, número, bairro, cidade/UF"
              className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          {/* Tipo Sanguíneo, Peso e Altura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="tipo_sanguineo"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Tipo Sanguíneo (LGPD)
              </label>
              <select
                id="tipo_sanguineo"
                value={formData.tipo_sanguineo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_sanguineo: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                  (tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="peso"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Peso (kg)
              </label>
              <input
                id="peso"
                type="number"
                step="0.1"
                min="0"
                value={formData.peso}
                onChange={(e) =>
                  setFormData({ ...formData, peso: e.target.value })
                }
                placeholder="Ex: 14.5"
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>

            <div>
              <label
                htmlFor="altura"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Altura (cm)
              </label>
              <input
                id="altura"
                type="number"
                step="1"
                min="0"
                value={formData.altura}
                onChange={(e) =>
                  setFormData({ ...formData, altura: e.target.value })
                }
                placeholder="Ex: 92"
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>
          </div>

          {/* Alergias */}
          <fieldset className="border-none p-0 m-0">
            <legend className="block text-sm font-semibold text-(--azul-escuro) mb-2">
              Possui Alergias ou Restrições Alimentares? (Criptografado AES-256)
            </legend>
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="alergia-nao"
                  name="alergia"
                  checked={!formData.temAlergia}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      temAlergia: false,
                      alergiasTexto: '',
                    })
                  }
                  className="w-4 h-4 text-(--orange) cursor-pointer"
                />
                <label
                  htmlFor="alergia-nao"
                  className="ml-2 cursor-pointer text-(--azul-escuro) font-medium"
                >
                  Não
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="alergia-sim"
                  name="alergia"
                  checked={formData.temAlergia}
                  onChange={() =>
                    setFormData({ ...formData, temAlergia: true })
                  }
                  className="w-4 h-4 text-(--orange) cursor-pointer"
                />
                <label
                  htmlFor="alergia-sim"
                  className="ml-2 cursor-pointer text-(--azul-escuro) font-medium"
                >
                  Sim
                </label>
              </div>
            </div>
          </fieldset>

          {formData.temAlergia && (
            <div>
              <label
                htmlFor="alergia-texto"
                className="block text-sm font-semibold text-(--azul-escuro) mb-1"
              >
                Especifique a(s) alergia(s) *
              </label>
              <textarea
                id="alergia-texto"
                value={formData.alergiasTexto}
                onChange={(e) =>
                  setFormData({ ...formData, alergiasTexto: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange) resize-none"
                placeholder="Digite a(s) alergia(s) do aluno"
                rows="2"
              />
            </div>
          )}

          {/* Observações Médicas / Pedagógicas */}
          <div>
            <label
              htmlFor="observacoes"
              className="block text-sm font-semibold text-(--azul-escuro) mb-1"
            >
              Observações Clínicas e Pedagógicas (Criptografado AES-256)
            </label>
            <textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange) resize-none"
              placeholder="Cuidados especiais, medicamentos, rotina de sono..."
              rows="2"
            />
          </div>

          <div className="flex gap-4 pt-3">
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-(--dark-orange) disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={handleFecharModal}
              disabled={salvando}
              className="flex-1 bg-(--border-gray) text-(--azul-escuro) py-3 px-6 rounded-lg text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-(--border-light) disabled:opacity-50 border-none"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
