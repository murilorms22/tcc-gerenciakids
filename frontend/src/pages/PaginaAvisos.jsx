import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBell,
  faPlus,
  faTrash,
  faExclamationCircle,
  faBullhorn,
  faUserEdit,
  faCalendarAlt,
  faCheck,
  faTimes,
  faPen,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import avisoService from '../services/avisoService';
import turmaService from '../services/turmaService';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

export default function PaginaAvisos() {
  const { user } = useAuth();
  const role = user?.role || 'RESPONSAVEL';
  const isAdminOrDirecao = role === 'ADMIN' || role === 'DIRECAO';
  const isProfessor = role === 'PROFESSOR';
  const canCreate = isAdminOrDirecao || isProfessor;

  const [avisos, setAvisos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [avisoEditandoAprovacao, setAvisoEditandoAprovacao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    prioridade: 'NORMAL',
    turmaId: '',
  });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [avisosData, turmasData] = await Promise.all([
        avisoService.listar(),
        turmaService.listar(),
      ]);
      setAvisos(Array.isArray(avisosData) ? avisosData : []);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar o mural de avisos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const avisosPendentes = avisos.filter((av) => av.status === 'PENDENTE');
  const avisosPublicados = avisos.filter(
    (av) => !av.status || av.status === 'APROVADO',
  );

  const avisosFiltrados = avisosPublicados.filter((av) => {
    if (filtroPrioridade && av.prioridade !== filtroPrioridade) return false;
    if (filtroTurma === 'GERAL' && av.turmaId !== null) return false;
    if (
      filtroTurma &&
      filtroTurma !== 'GERAL' &&
      String(av.turmaId) !== String(filtroTurma)
    ) {
      return false;
    }
    return true;
  });

  const handleAbrirNovoAviso = () => {
    setAvisoEditandoAprovacao(null);
    setFormData({
      titulo: '',
      conteudo: '',
      prioridade: 'NORMAL',
      turmaId: '',
    });
    setModalAberto(true);
  };

  const handleAbrirEditarEPublicar = (aviso) => {
    if (!isAdminOrDirecao) return;
    setAvisoEditandoAprovacao(aviso);
    setFormData({
      titulo: aviso.titulo || '',
      conteudo: aviso.conteudo || '',
      prioridade: aviso.prioridade || 'NORMAL',
      turmaId: aviso.turmaId ? String(aviso.turmaId) : '',
    });
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAvisoEditandoAprovacao(null);
  };

  const handleSalvarAviso = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.conteudo.trim()) return;

    setSalvando(true);
    setMensagemFeedback('');
    try {
      if (avisoEditandoAprovacao && isAdminOrDirecao) {
        const atualizado = await avisoService.atualizar(
          avisoEditandoAprovacao.id,
          {
            titulo: formData.titulo.trim(),
            conteudo: formData.conteudo.trim(),
            prioridade: formData.prioridade,
            turmaId: formData.turmaId ? Number(formData.turmaId) : null,
            status: 'APROVADO',
          },
        );
        setAvisos((prev) =>
          prev.map((a) =>
            a.id === avisoEditandoAprovacao.id
              ? { ...atualizado, status: 'APROVADO' }
              : a,
          ),
        );
        setMensagemFeedback('Aviso editado e publicado com sucesso no mural!');
      } else {
        const novo = await avisoService.criar({
          titulo: formData.titulo.trim(),
          conteudo: formData.conteudo.trim(),
          prioridade: formData.prioridade,
          autorNome:
            user?.nome ||
            (isProfessor ? 'Professor(a)' : 'Coordenação Escolar'),
          turmaId: formData.turmaId ? Number(formData.turmaId) : null,
        });

        const avisoComStatus = {
          ...novo,
          status: novo?.status || (isProfessor ? 'PENDENTE' : 'APROVADO'),
        };

        setAvisos((prev) => [avisoComStatus, ...prev]);

        if (isProfessor) {
          setMensagemFeedback(
            'Aviso enviado para a lista de aprovações da direção! Ele será publicado após avaliação.',
          );
        } else {
          setMensagemFeedback('Aviso publicado com sucesso no mural!');
        }
      }

      handleFecharModal();
      setFormData({
        titulo: '',
        conteudo: '',
        prioridade: 'NORMAL',
        turmaId: '',
      });
    } catch (error) {
      console.error('Erro ao salvar aviso:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleConcordarAviso = async (aviso) => {
    if (!isAdminOrDirecao) return;
    try {
      const atualizado = await avisoService.atualizar(aviso.id, {
        status: 'APROVADO',
      });
      setAvisos((prev) =>
        prev.map((a) =>
          a.id === aviso.id ? { ...atualizado, status: 'APROVADO' } : a,
        ),
      );
      setMensagemFeedback(
        `Publicação "${aviso.titulo}" aprovada e publicada no mural!`,
      );
    } catch (error) {
      console.error('Erro ao aprovar aviso:', error);
    }
  };

  const handleNegarAviso = async (aviso) => {
    if (!isAdminOrDirecao) return;
    try {
      await avisoService.atualizar(aviso.id, { status: 'REJEITADO' });
      setAvisos((prev) => prev.filter((a) => a.id !== aviso.id));
      setMensagemFeedback(`Publicação "${aviso.titulo}" negada pela direção.`);
    } catch (error) {
      console.error('Erro ao negar aviso:', error);
    }
  };

  const handleExcluirAviso = async (id) => {
    if (!isAdminOrDirecao) return;
    try {
      await avisoService.deletar(id);
      setAvisos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
    }
  };

  const formatarData = (iso) => {
    if (!iso) return 'Hoje';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (carregando) {
    return (
      <h1 className="p-8 text-center text-(--text-gray)">
        Carregando mural de avisos...
      </h1>
    );
  }

  if (erro) {
    return <h1 className="p-8 text-center text-red-500">{erro}</h1>;
  }

  return (
    <div className="w-full p-4 md:p-8">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
            title="Voltar ao painel"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-(--azul-escuro)">
              Mural de Avisos e Comunicados
            </h1>
            <p className="text-base text-(--text-gray)">
              Comunicação oficial entre direção, professores e famílias.
            </p>
          </div>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleAbrirNovoAviso}
            className="bg-(--orange) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--light-orange) border-none"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Publicar Aviso</span>
          </button>
        )}
      </header>

      {mensagemFeedback && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 font-semibold flex items-center justify-between">
          <span>{mensagemFeedback}</span>
          <button
            type="button"
            onClick={() => setMensagemFeedback('')}
            className="bg-transparent border-none text-green-800 cursor-pointer font-bold"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* Lista de Aprovações para a Direção (e visualização de pendentes pelo Professor) */}
      {(isAdminOrDirecao ||
        (isProfessor && avisosPendentes.length > 0)) && (
        <section className="mb-8 bg-amber-50/70 border border-amber-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <FontAwesomeIcon
                icon={faClock}
                className="text-(--orange) text-xl"
              />
              <h2 className="text-xl font-bold text-(--azul-escuro) m-0">
                {isAdminOrDirecao
                  ? 'Lista de Aprovações de Avisos'
                  : 'Avisos Aguardando Aprovação da Direção'}
              </h2>
            </div>
            <span className="text-xs font-bold bg-orange-100 text-(--dark-orange) px-3 py-1 rounded-full">
              {avisosPendentes.length} pendente(s)
            </span>
          </div>

          {avisosPendentes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {avisosPendentes.map((aviso) => {
                const isUrgente = aviso.prioridade === 'URGENTE';
                return (
                  <div
                    key={aviso.id}
                    className="relative bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[6px] border-l-amber-500 flex flex-col justify-between"
                  >
                    {isAdminOrDirecao && (
                      <button
                        type="button"
                        onClick={() => handleAbrirEditarEPublicar(aviso)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-orange-50 text-(--orange) hover:bg-(--orange) hover:text-white transition-colors border border-orange-200 cursor-pointer flex items-center justify-center"
                        title="Editar e publicar"
                        aria-label="Editar e publicar"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-3 pr-10">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                          <FontAwesomeIcon icon={faClock} />
                          Aguardando Aprovação
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                            isUrgente
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-(--dark-orange)'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={isUrgente ? faExclamationCircle : faBullhorn}
                          />
                          {aviso.prioridade}
                        </span>

                        <span className="text-xs font-semibold bg-(--bg-gray-light) text-(--azul-escuro) px-3 py-1 rounded-full border border-(--border-gray)">
                          {aviso.turma?.nome
                            ? `Turma: ${aviso.turma.nome}`
                            : 'Geral • Toda a Escola'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-(--azul-escuro) mb-2">
                        {aviso.titulo}
                      </h3>

                      <p className="text-sm text-(--not-black) leading-relaxed mb-4">
                        {aviso.conteudo}
                      </p>
                    </div>

                    <div>
                      <div className="pt-3 border-t border-(--border-light) flex items-center justify-between text-xs text-(--text-gray)">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <FontAwesomeIcon icon={faUserEdit} />
                          Solicitado por: {aviso.autorNome}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {formatarData(aviso.createdAt)}
                        </span>
                      </div>

                      {isAdminOrDirecao && (
                        <div className="mt-4 pt-3 border-t border-(--border-light) flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              type="button"
                              onClick={() => handleConcordarAviso(aviso)}
                              className="flex-1 bg-(--success-green) hover:bg-(--success-green-hover) text-white py-2 px-4 rounded-lg text-sm font-bold cursor-pointer border-none flex items-center justify-center gap-2 transition-colors"
                              title="Concordar e publicar aviso"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                              <span>Concordar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleNegarAviso(aviso)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-bold cursor-pointer border-none flex items-center justify-center gap-2 transition-colors"
                              title="Negar publicação do aviso"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              <span>Negar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-(--text-gray) m-0">
              Nenhuma solicitação de publicação de aviso pendente no momento.
            </p>
          )}
        </section>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filtroPrioridade}
          onChange={(e) => setFiltroPrioridade(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todas as prioridades</option>
          <option value="URGENTE">Apenas Urgentes</option>
          <option value="NORMAL">Apenas Normais</option>
        </select>

        <select
          value={filtroTurma}
          onChange={(e) => setFiltroTurma(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todos os destinatários</option>
          <option value="GERAL">Comunicados Gerais (Toda a Escola)</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              Turma: {t.nome} ({t.turno})
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Cards de Avisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {avisosFiltrados.map((aviso) => {
          const isUrgente = aviso.prioridade === 'URGENTE';
          return (
            <div
              key={aviso.id}
              className={`bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[6px] flex flex-col justify-between ${
                isUrgente ? 'border-l-red-500' : 'border-l-(--orange)'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        isUrgente
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-(--dark-orange)'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isUrgente ? faExclamationCircle : faBullhorn}
                      />
                      {aviso.prioridade}
                    </span>

                    <span className="text-xs font-semibold bg-(--bg-gray-light) text-(--azul-escuro) px-3 py-1 rounded-full border border-(--border-gray)">
                      {aviso.turma?.nome
                        ? `Turma: ${aviso.turma.nome}`
                        : 'Geral • Toda a Escola'}
                    </span>
                  </div>

                  {isAdminOrDirecao && (
                    <button
                      type="button"
                      onClick={() => handleExcluirAviso(aviso.id)}
                      className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer p-1"
                      title="Excluir comunicado"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-bold text-(--azul-escuro) mb-2">
                  {aviso.titulo}
                </h2>

                <p className="text-base text-(--not-black) leading-relaxed mb-4">
                  {aviso.conteudo}
                </p>
              </div>

              <div className="pt-3 border-t border-(--border-light) flex items-center justify-between text-xs text-(--text-gray)">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FontAwesomeIcon icon={faUserEdit} />
                  {aviso.autorNome}
                </span>
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {formatarData(aviso.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {avisosFiltrados.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center text-(--text-gray)">
          <FontAwesomeIcon icon={faBell} size="2x" className="mb-3" />
          <p className="text-lg font-semibold">
            Nenhum comunicado encontrado para o filtro selecionado.
          </p>
        </div>
      )}

      {/* Modal de Criação / Edição e Publicação de Aviso */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title={
          avisoEditandoAprovacao
            ? 'Editar e Publicar Comunicado'
            : isProfessor
              ? 'Solicitar Publicação de Comunicado'
              : 'Publicar Novo Comunicado'
        }
      >
        <form onSubmit={handleSalvarAviso} className="space-y-4">
          {isProfessor && !avisoEditandoAprovacao && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              Nota: Como professor(a), seu aviso será encaminhado para a lista
              de aprovações da direção antes de ser publicado no mural.
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Título do Comunicado *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Ex: Reunião de Pais e Mestres"
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Prioridade *
              </label>
              <select
                value={formData.prioridade}
                onChange={(e) =>
                  setFormData({ ...formData, prioridade: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Destinatário
              </label>
              <select
                value={formData.turmaId}
                onChange={(e) =>
                  setFormData({ ...formData, turmaId: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="">Geral (Toda a Escola)</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.turno})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Mensagem / Conteúdo *
            </label>
            <textarea
              rows="4"
              required
              value={formData.conteudo}
              onChange={(e) =>
                setFormData({ ...formData, conteudo: e.target.value })
              }
              placeholder="Escreva os detalhes do comunicado para os responsáveis..."
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-(--orange) text-white py-3 px-6 rounded-lg text-base font-bold cursor-pointer hover:bg-(--dark-orange) border-none disabled:opacity-50"
            >
              {salvando
                ? 'Processando...'
                : avisoEditandoAprovacao
                  ? 'Editar e Publicar'
                  : isProfessor
                    ? 'Enviar para Aprovação'
                    : 'Publicar Aviso'}
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

