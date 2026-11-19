import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPen,
  faTrash,
  faSync,
  faChalkboardUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import turmaService from '../../services/turmaService';
import responsavelService from '../../services/responsavelService';
import Modal from '../../components/Modal';

export default function AdminTurmas() {
  const [abaAtiva, setAbaAtiva] = useState('turmas');
  const [turmas, setTurmas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [usuariosResponsaveis, setUsuariosResponsaveis] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Modal de Turma
  const [modalTurma, setModalTurma] = useState(false);
  const [turmaEditando, setTurmaEditando] = useState(null);
  const [formTurma, setFormTurma] = useState({
    nome: '',
    turno: 'Manhã',
    ano_letivo: 2026,
  });

  // Modal de Responsável
  const [modalResp, setModalResp] = useState(false);
  const [respEditando, setRespEditando] = useState(null);
  const [formResp, setFormResp] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    userId: '',
  });

  const [erroModal, setErroModal] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [turmasData, respData, usersData] = await Promise.all([
        turmaService.listar(),
        responsavelService.listar(),
        responsavelService.listarUsuariosResponsaveis().catch(() => []),
      ]);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);
      setResponsaveis(Array.isArray(respData) ? respData : []);
      setUsuariosResponsaveis(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Erro ao carregar turmas e responsáveis:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const aplicarMascaraCPF = (valor) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 3) return digitos;
    if (digitos.length <= 6)
      return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    if (digitos.length <= 9)
      return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  };

  const aplicarMascaraTelefone = (valor) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 6)
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10)
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  };

  // --- Handlers de Turmas ---
  const abrirNovaTurma = () => {
    setTurmaEditando('nova');
    setErroModal('');
    setFormTurma({ nome: '', turno: 'Manhã', ano_letivo: 2026 });
    setModalTurma(true);
  };

  const abrirEdicaoTurma = (t) => {
    setTurmaEditando(t.id);
    setErroModal('');
    setFormTurma({
      nome: t.nome,
      turno: t.turno,
      ano_letivo: t.ano_letivo,
    });
    setModalTurma(true);
  };

  const salvarTurma = async (e) => {
    e.preventDefault();
    setErroModal('');
    if (!formTurma.nome.trim()) {
      setErroModal('Informe o nome da turma.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: formTurma.nome.trim(),
        turno: formTurma.turno,
        ano_letivo: Number(formTurma.ano_letivo),
      };
      if (turmaEditando === 'nova') {
        await turmaService.criar(payload);
      } else {
        await turmaService.atualizar(turmaEditando, payload);
      }
      setModalTurma(false);
      await carregarDados();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setErroModal(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setSalvando(false);
    }
  };

  const excluirTurma = async (id) => {
    if (window.confirm('Deseja realmente excluir esta turma?')) {
      try {
        await turmaService.deletar(id);
        await carregarDados();
      } catch (error) {
        alert(
          error.response?.data?.message ||
            'Não é possível excluir turma com alunos vinculados.',
        );
      }
    }
  };

  // --- Handlers de Responsáveis ---
  const abrirNovoResp = () => {
    setRespEditando('novo');
    setErroModal('');
    setFormResp({ nome: '', cpf: '', telefone: '', userId: '' });
    setModalResp(true);
  };

  const abrirEdicaoResp = (r) => {
    setRespEditando(r.id);
    setErroModal('');
    setFormResp({
      nome: r.nome,
      cpf: r.cpf,
      telefone: r.telefone,
      userId: r.userId || '',
    });
    setModalResp(true);
  };

  const salvarResp = async (e) => {
    e.preventDefault();
    setErroModal('');
    if (!formResp.nome.trim() || !formResp.cpf.trim() || !formResp.telefone.trim()) {
      setErroModal('Preencha nome, CPF e telefone do responsável.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: formResp.nome.trim(),
        cpf: formResp.cpf.trim(),
        telefone: formResp.telefone.trim(),
        userId: formResp.userId ? Number(formResp.userId) : null,
      };
      if (respEditando === 'novo') {
        await responsavelService.criar(payload);
      } else {
        await responsavelService.atualizar(respEditando, payload);
      }
      setModalResp(false);
      await carregarDados();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setErroModal(Array.isArray(msg) ? msg.join(' ') : msg);
    } finally {
      setSalvando(false);
    }
  };

  const excluirResp = async (id) => {
    if (window.confirm('Deseja realmente excluir este responsável?')) {
      try {
        await responsavelService.deletar(id);
        await carregarDados();
      } catch (error) {
        alert(
          error.response?.data?.message ||
            'Não é possível excluir responsável com alunos vinculados.',
        );
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-(--azul-escuro) mb-6">
        Secretaria: Gestão de Turmas e Responsáveis
      </h1>

      {/* Seletor de Abas */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAbaAtiva('turmas')}
            className={`px-6 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 border-none transition-colors ${
              abaAtiva === 'turmas'
                ? 'bg-(--orange) text-white'
                : 'bg-white text-(--azul-escuro) hover:bg-(--border-light)'
            }`}
          >
            <FontAwesomeIcon icon={faChalkboardUser} />
            <span>Turmas ({turmas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('responsaveis')}
            className={`px-6 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 border-none transition-colors ${
              abaAtiva === 'responsaveis'
                ? 'bg-(--orange) text-white'
                : 'bg-white text-(--azul-escuro) hover:bg-(--border-light)'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Responsáveis ({responsaveis.length})</span>
          </button>
        </div>

        <div className="flex gap-3">
          {abaAtiva === 'turmas' ? (
            <button
              type="button"
              onClick={abrirNovaTurma}
              className="bg-(--orange) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 hover:bg-(--dark-orange) border-none"
            >
              <FontAwesomeIcon icon={faPlus} /> Nova Turma
            </button>
          ) : (
            <button
              type="button"
              onClick={abrirNovoResp}
              className="bg-(--orange) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 hover:bg-(--dark-orange) border-none"
            >
              <FontAwesomeIcon icon={faPlus} /> Novo Responsável
            </button>
          )}

          <button
            type="button"
            onClick={carregarDados}
            disabled={carregando}
            className="bg-(--azul-escuro) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 hover:bg-(--azul-claro) border-none"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={carregando ? 'animate-spin' : ''}
            />
            <span>Recarregar</span>
          </button>
        </div>
      </div>

      {/* Tabela de Turmas */}
      {abaAtiva === 'turmas' && (
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-(--bg-gray-light)">
              <tr className="border-b border-(--border-gray)">
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Nome da Turma
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Turno
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Ano Letivo
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Alunos Matriculados
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-(--text-gray)">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-(--border-light) last:border-b-0 hover:bg-(--bg-gray-light)"
                >
                  <td className="px-6 py-4 font-bold text-(--text-gray)">
                    #{t.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-(--azul-escuro)">
                    {t.nome}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-orange-100 text-(--dark-orange) px-3 py-1 rounded-full text-xs font-bold">
                      {t.turno}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-(--not-black)">
                    {t.ano_letivo}
                  </td>
                  <td className="px-6 py-4 font-semibold text-(--azul-escuro)">
                    {t._count?.alunos ?? 0} aluno(s)
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      type="button"
                      onClick={() => abrirEdicaoTurma(t)}
                      className="text-(--orange) hover:text-(--dark-orange) bg-transparent border-none cursor-pointer"
                      title="Editar turma"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirTurma(t.id)}
                      className="text-red-600 hover:text-red-800 bg-transparent border-none cursor-pointer"
                      title="Excluir turma"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabela de Responsáveis */}
      {abaAtiva === 'responsaveis' && (
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-(--bg-gray-light)">
              <tr className="border-b border-(--border-gray)">
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Nome do Responsável
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  CPF
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Conta de Acesso (Login LGPD)
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-(--text-gray)">
                  Filhos
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-(--text-gray)">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {responsaveis.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-(--border-light) last:border-b-0 hover:bg-(--bg-gray-light)"
                >
                  <td className="px-6 py-4 font-bold text-(--azul-escuro)">
                    {r.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-(--not-black)">
                    {r.cpf}
                  </td>
                  <td className="px-6 py-4 text-sm text-(--not-black)">
                    {r.telefone}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {r.user ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        {r.user.email}
                      </span>
                    ) : (
                      <span className="text-(--text-gray) text-xs">
                        Sem conta vinculada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-(--azul-escuro)">
                    {r.alunos?.length || 0} filho(s)
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      type="button"
                      onClick={() => abrirEdicaoResp(r)}
                      className="text-(--orange) hover:text-(--dark-orange) bg-transparent border-none cursor-pointer"
                      title="Editar responsável"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirResp(r.id)}
                      className="text-red-600 hover:text-red-800 bg-transparent border-none cursor-pointer"
                      title="Excluir responsável"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Turma */}
      <Modal
        isOpen={modalTurma}
        onClose={() => setModalTurma(false)}
        title={turmaEditando === 'nova' ? 'Cadastrar Nova Turma' : 'Editar Turma'}
      >
        <form onSubmit={salvarTurma} className="space-y-4">
          {erroModal && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-semibold">
              {erroModal}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Nome da Turma *
            </label>
            <input
              type="text"
              required
              value={formTurma.nome}
              onChange={(e) =>
                setFormTurma({ ...formTurma, nome: e.target.value })
              }
              placeholder="Ex: Maternal II - Estrelinhas"
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Turno *
              </label>
              <select
                value={formTurma.turno}
                onChange={(e) =>
                  setFormTurma({ ...formTurma, turno: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Integral">Integral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Ano Letivo *
              </label>
              <input
                type="number"
                required
                min="2020"
                value={formTurma.ano_letivo}
                onChange={(e) =>
                  setFormTurma({ ...formTurma, ano_letivo: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-base font-bold cursor-pointer hover:bg-(--dark-orange) border-none"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setModalTurma(false)}
              className="flex-1 bg-(--border-gray) text-(--azul-escuro) py-3 px-6 rounded-lg text-base font-bold cursor-pointer border-none"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Responsável */}
      <Modal
        isOpen={modalResp}
        onClose={() => setModalResp(false)}
        title={
          respEditando === 'novo'
            ? 'Cadastrar Novo Responsável'
            : 'Editar Responsável'
        }
      >
        <form onSubmit={salvarResp} className="space-y-4">
          {erroModal && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-semibold">
              {erroModal}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formResp.nome}
              onChange={(e) =>
                setFormResp({ ...formResp, nome: e.target.value })
              }
              placeholder="Ex: Fernanda Souza Martins"
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                CPF *
              </label>
              <input
                type="text"
                required
                value={formResp.cpf}
                onChange={(e) =>
                  setFormResp({
                    ...formResp,
                    cpf: aplicarMascaraCPF(e.target.value),
                  })
                }
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Telefone *
              </label>
              <input
                type="text"
                required
                value={formResp.telefone}
                onChange={(e) =>
                  setFormResp({
                    ...formResp,
                    telefone: aplicarMascaraTelefone(e.target.value),
                  })
                }
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Vincular Conta de Usuário (Perfil RESPONSAVEL)
            </label>
            <select
              value={formResp.userId}
              onChange={(e) =>
                setFormResp({ ...formResp, userId: e.target.value })
              }
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            >
              <option value="">Sem conta de login vinculada</option>
              {usuariosResponsaveis.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-base font-bold cursor-pointer hover:bg-(--dark-orange) border-none"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setModalResp(false)}
              className="flex-1 bg-(--border-gray) text-(--azul-escuro) py-3 px-6 rounded-lg text-base font-bold cursor-pointer border-none"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

