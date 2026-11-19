import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faPlus,
  faPen,
  faTrash,
  faClock,
  faDoorOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import atividadeService from '../services/atividadeService';
import turmaService from '../services/turmaService';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

function PaginaAgenda() {
  const { user } = useAuth();
  const role = user?.role || 'PROFESSOR';
  const canEdit =
    role === 'ADMIN' || role === 'DIRECAO' || role === 'PROFESSOR';

  const [atividades, setAtividades] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [atividadesFiltradas, setAtividadesFiltradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    horario: '09:00',
    sala: 'Sala 01',
    turmaId: '',
  });

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const [atividadesData, turmasData] = await Promise.all([
        atividadeService.listar(),
        turmaService.listar(),
      ]);

      const listaTurmas = Array.isArray(turmasData) ? turmasData : [];
      setTurmas(listaTurmas);

      const listaAtividades = Array.isArray(atividadesData)
        ? atividadesData
        : [];
      setAtividades(listaAtividades);
      setAtividadesFiltradas(listaAtividades);

      if (listaTurmas.length > 0) {
        setFormData((prev) => ({
          ...prev,
          turmaId: prev.turmaId || listaTurmas[0].id,
        }));
      }
    } catch (err) {
      setErro('Falha ao carregar as atividades.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    let processados = [...atividades];
    if (termoPesquisa) {
      processados = processados.filter(
        (item) =>
          (item.titulo || '')
            .toLowerCase()
            .includes(termoPesquisa.toLowerCase()) ||
          (item.descricao || '')
            .toLowerCase()
            .includes(termoPesquisa.toLowerCase()),
      );
    }
    if (turmaFiltro) {
      processados = processados.filter(
        (item) => String(item.turmaId) === String(turmaFiltro),
      );
    }
    setAtividadesFiltradas(processados);
  }, [atividades, termoPesquisa, turmaFiltro]);

  const handleToggleConcluida = async (atividade) => {
    if (!canEdit) return;
    const novoStatus = !atividade.concluida;

    try {
      const atualizada = await atividadeService.atualizar(atividade.id, {
        concluida: novoStatus,
      });
      setAtividades((prev) =>
        prev.map((item) => (item.id === atividade.id ? atualizada : item)),
      );
    } catch (error) {
      console.error('Erro ao atualizar status da atividade:', error);
    }
  };

  const handleAbrirNovaAtividade = () => {
    setAtividadeEditando(null);
    setFormData({
      titulo: '',
      descricao: '',
      horario: '09:00',
      sala: 'Sala 01',
      turmaId: turmas[0]?.id || '',
    });
    setModalAberto(true);
  };

  const handleAbrirEditarAtividade = (atividade) => {
    if (!canEdit) return;
    setAtividadeEditando(atividade);
    setFormData({
      titulo: atividade.titulo || '',
      descricao: atividade.descricao || '',
      horario: atividade.horario || '09:00',
      sala: atividade.sala || 'Sala 01',
      turmaId: atividade.turmaId || turmas[0]?.id || '',
    });
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAtividadeEditando(null);
  };

  const handleSalvarAtividade = async (e) => {
    e.preventDefault();
    if (
      !formData.titulo.trim() ||
      !formData.horario.trim() ||
      !formData.sala.trim() ||
      !formData.turmaId
    ) {
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        horario: formData.horario.trim(),
        sala: formData.sala.trim(),
        turmaId: Number(formData.turmaId),
      };

      if (atividadeEditando) {
        const atualizada = await atividadeService.atualizar(
          atividadeEditando.id,
          payload,
        );
        setAtividades((prev) =>
          prev.map((item) =>
            item.id === atividadeEditando.id ? atualizada : item,
          ),
        );
      } else {
        const criada = await atividadeService.criar({
          ...payload,
          concluida: false,
        });
        setAtividades((prev) => [...prev, criada]);
      }

      handleFecharModal();
      setFormData({
        titulo: '',
        descricao: '',
        horario: '09:00',
        sala: 'Sala 01',
        turmaId: turmas[0]?.id || '',
      });
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirAtividade = async (id) => {
    if (!canEdit) return;
    try {
      await atividadeService.deletar(id);
      setAtividades((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
    }
  };

  if (carregando)
    return (
      <h1 className="p-8 text-center text-gray-500">
        Carregando atividades...
      </h1>
    );
  if (erro)
    return <h1 className="p-8 text-center text-red-500">Erro: {erro}</h1>;

  return (
    <div className="w-full p-4 md:p-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
            title="Voltar ao painel"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-(--azul-escuro) text-3xl md:text-4xl font-bold">
              Agenda de Atividades
            </h1>
            <p className="text-base md:text-lg text-(--text-gray) mt-1">
              Controle de atividades pedagógicas e rotina diária por turma.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleAbrirNovaAtividade}
            className="bg-(--orange) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--light-orange) border-none"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Nova Atividade</span>
          </button>
        )}
      </header>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative grow min-w-[240px]">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)"
          />
          <input
            type="text"
            placeholder="Pesquisar atividade..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) bg-white text-base"
          />
        </div>

        <select
          value={turmaFiltro}
          onChange={(e) => setTurmaFiltro(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todas as turmas</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} ({t.turno})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.5fr_1fr_0.8fr] items-center py-5 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray)">
          <div>Descrição da Atividade</div>
          <div>Turma & Local</div>
          <div className="text-center">Horário</div>
          <div className="text-center">Status</div>
        </div>

        <div>
          {atividadesFiltradas.length > 0 ? (
            atividadesFiltradas.map((atividade) => (
              <div
                className="grid grid-cols-[2.5fr_1.5fr_1fr_0.8fr] items-center py-4 px-6 gap-4 border-b border-(--border-light) transition-colors hover:bg-gray-50"
                key={atividade.id}
              >
                <div>
                  <div
                    className={`font-bold text-lg ${
                      atividade.concluida
                        ? 'text-gray-400 line-through'
                        : 'text-(--azul-escuro)'
                    }`}
                  >
                    {atividade.titulo}
                  </div>
                  {atividade.descricao && (
                    <p className="text-sm text-(--text-gray) m-0">
                      {atividade.descricao}
                    </p>
                  )}
                </div>

                <div className="text-sm">
                  <p className="font-semibold text-(--azul-escuro) m-0">
                    {atividade.turma?.nome || 'Turma'}
                  </p>
                  <p className="text-xs text-(--text-gray) m-0 flex items-center gap-1">
                    <FontAwesomeIcon icon={faDoorOpen} /> {atividade.sala}
                  </p>
                </div>

                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 bg-(--bg-gray-light) text-(--azul-escuro) px-3 py-1 rounded-lg font-bold text-sm">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-(--orange)"
                    />
                    {atividade.horario}
                  </span>
                </div>

                <div className="text-center flex items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleToggleConcluida(atividade)}
                    className="bg-transparent border-none cursor-pointer disabled:cursor-default"
                    title={
                      atividade.concluida
                        ? 'Concluída (clique para reabrir)'
                        : 'Pendente (clique para concluir)'
                    }
                  >
                    {atividade.concluida ? (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-green-500 text-2xl"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="text-gray-300 text-2xl hover:text-gray-400"
                      />
                    )}
                  </button>

                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAbrirEditarAtividade(atividade)}
                        className="text-(--orange) hover:text-(--dark-orange) bg-transparent border-none cursor-pointer"
                        title="Editar atividade"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExcluirAtividade(atividade.id)}
                        className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                        title="Excluir atividade"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-(--text-gray)">
              Nenhuma atividade encontrada.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nova / Editar Atividade */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title={
          atividadeEditando ? 'Editar Atividade' : 'Cadastrar Nova Atividade'
        }
      >
        <form onSubmit={handleSalvarAtividade} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Título da Atividade *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Ex: Oficina de Massinha Caseira"
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Descrição Pedagógica
            </label>
            <textarea
              rows="2"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Objetivo e materiais utilizados..."
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Horário *
              </label>
              <input
                type="text"
                required
                value={formData.horario}
                onChange={(e) =>
                  setFormData({ ...formData, horario: e.target.value })
                }
                placeholder="Ex: 09:30"
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Sala / Local *
              </label>
              <input
                type="text"
                required
                value={formData.sala}
                onChange={(e) =>
                  setFormData({ ...formData, sala: e.target.value })
                }
                placeholder="Ex: Sala 01"
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Turma *
              </label>
              <select
                required
                value={formData.turmaId}
                onChange={(e) =>
                  setFormData({ ...formData, turmaId: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="">Selecione...</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-base font-bold cursor-pointer hover:bg-(--dark-orange) border-none disabled:opacity-50"
            >
              {salvando
                ? 'Salvando...'
                : atividadeEditando
                  ? 'Salvar Alterações'
                  : 'Salvar Atividade'}
            </button>
            <button
              type="button"
              onClick={handleFecharModal}
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

export default PaginaAgenda;
