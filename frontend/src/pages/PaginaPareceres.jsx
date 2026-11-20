import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBookOpen,
  faPlus,
  faPen,
  faTrash,
  faSearch,
  faUserEdit,
  faCalendarAlt,
  faChalkboardUser,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import parecerService from '../services/parecerService';
import alunoService from '../services/alunoService';
import turmaService from '../services/turmaService';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

const PERIODOS_OPCOES = [
  '1º Semestre / 2026',
  '2º Semestre / 2026',
  'Avaliação Diagnóstica',
  'Acompanhamento Bimestral',
];

export default function PaginaPareceres() {
  const { user } = useAuth();
  const role = user?.role || 'PROFESSOR';
  const canEdit =
    role === 'PROFESSOR' || role === 'DIRECAO' || role === 'ADMIN';

  const [pareceres, setPareceres] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('');
  const [alunoFiltro, setAlunoFiltro] = useState('');
  const [periodoFiltro, setPeriodoFiltro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [parecerEditando, setParecerEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    alunoId: '',
    periodo: '1º Semestre / 2026',
    titulo: '',
    conteudo: '',
  });

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const [pareceresData, alunosData, turmasData] = await Promise.all([
        parecerService.listar(),
        alunoService.listar(),
        turmaService.listar(),
      ]);

      const listaAlunos = Array.isArray(alunosData) ? alunosData : [];
      setPareceres(Array.isArray(pareceresData) ? pareceresData : []);
      setAlunos(listaAlunos);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);

      if (listaAlunos.length > 0) {
        setFormData((prev) => ({
          ...prev,
          alunoId: prev.alunoId || String(listaAlunos[0].id),
        }));
      }
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar os pareceres pedagógicos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const pareceresFiltrados = pareceres.filter((p) => {
    const nomeAluno = p.aluno?.nome || '';
    const turmaIdAluno = p.aluno?.turmaId ?? p.aluno?.turma?.id;

    if (termoPesquisa) {
      const termo = termoPesquisa.toLowerCase();
      const match =
        nomeAluno.toLowerCase().includes(termo) ||
        (p.titulo || '').toLowerCase().includes(termo) ||
        (p.conteudo || '').toLowerCase().includes(termo) ||
        (p.professorNome || '').toLowerCase().includes(termo);
      if (!match) return false;
    }

    if (turmaFiltro && String(turmaIdAluno) !== String(turmaFiltro)) {
      return false;
    }

    if (alunoFiltro && String(p.alunoId) !== String(alunoFiltro)) {
      return false;
    }

    if (periodoFiltro && p.periodo !== periodoFiltro) {
      return false;
    }

    return true;
  });

  const handleAbrirNovoParecer = () => {
    setParecerEditando(null);
    setFormData({
      alunoId: alunos[0]?.id ? String(alunos[0].id) : '',
      periodo: '1º Semestre / 2026',
      titulo: '',
      conteudo: '',
    });
    setModalAberto(true);
  };

  const handleAbrirEditarParecer = (parecer) => {
    if (!canEdit) return;
    setParecerEditando(parecer);
    setFormData({
      alunoId: String(parecer.alunoId || ''),
      periodo: parecer.periodo || '1º Semestre / 2026',
      titulo: parecer.titulo || '',
      conteudo: parecer.conteudo || '',
    });
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setParecerEditando(null);
  };

  const handleSalvarParecer = async (e) => {
    e.preventDefault();
    if (
      !formData.alunoId ||
      !formData.titulo.trim() ||
      !formData.conteudo.trim()
    ) {
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        alunoId: Number(formData.alunoId),
        periodo: formData.periodo,
        titulo: formData.titulo.trim(),
        conteudo: formData.conteudo.trim(),
        professorNome: user?.nome || 'Professor(a) Responsável',
      };

      if (parecerEditando) {
        const atualizado = await parecerService.atualizar(
          parecerEditando.id,
          payload,
        );
        setPareceres((prev) =>
          prev.map((item) =>
            item.id === parecerEditando.id ? atualizado : item,
          ),
        );
      } else {
        const criado = await parecerService.criar(payload);
        setPareceres((prev) => [criado, ...prev]);
      }

      handleFecharModal();
    } catch (error) {
      console.error('Erro ao salvar parecer pedagógico:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirParecer = async (id) => {
    if (!canEdit) return;
    try {
      await parecerService.deletar(id);
      setPareceres((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Erro ao excluir parecer:', error);
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
        Carregando pareceres pedagógicos...
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
              Pareceres Pedagógicos
            </h1>
            <p className="text-base text-(--text-gray)">
              Acompanhamento individual do desenvolvimento cognitivo, motor e
              socioemocional dos alunos.
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleAbrirNovoParecer}
            className="bg-(--orange) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--light-orange) border-none"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Novo Parecer</span>
          </button>
        )}
      </header>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative grow min-w-[220px]">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)"
          />
          <input
            type="text"
            placeholder="Pesquisar por aluno, título ou conteúdo..."
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

        <select
          value={alunoFiltro}
          onChange={(e) => setAlunoFiltro(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todos os alunos</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome || a.nome_completo}
            </option>
          ))}
        </select>

        <select
          value={periodoFiltro}
          onChange={(e) => setPeriodoFiltro(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todos os períodos</option>
          {PERIODOS_OPCOES.map((per) => (
            <option key={per} value={per}>
              {per}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Pareceres */}
      {pareceresFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pareceresFiltrados.map((parecer) => {
            const nomeAluno =
              parecer.aluno?.nome || `Aluno #${parecer.alunoId}`;
            const fotoAluno =
              parecer.aluno?.foto_perfil_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeAluno)}&background=ff7417&color=fff`;
            const nomeTurma = parecer.aluno?.turma?.nome || 'Turma Regular';

            return (
              <div
                key={parecer.id}
                className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[6px] border-l-(--orange) flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={fotoAluno}
                        alt={nomeAluno}
                        className="w-12 h-12 rounded-full object-cover border-2 border-(--orange) shrink-0"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-(--azul-escuro) m-0">
                          {nomeAluno}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-(--bg-gray-light) text-(--azul-escuro) px-2.5 py-0.5 rounded-full border border-(--border-gray)">
                            <FontAwesomeIcon icon={faChalkboardUser} />
                            {nomeTurma}
                          </span>
                          <span className="text-xs font-bold bg-orange-100 text-(--dark-orange) px-2.5 py-0.5 rounded-full">
                            {parecer.periodo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/alunos/${parecer.alunoId}`}
                        className="text-(--azul-escuro) hover:text-(--orange) p-1.5"
                        title="Ver ficha do aluno"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAbrirEditarParecer(parecer)}
                            className="text-(--orange) hover:text-(--dark-orange) bg-transparent border-none cursor-pointer p-1.5"
                            title="Editar parecer"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirParecer(parecer.id)}
                            className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer p-1.5"
                            title="Excluir parecer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-(--azul-escuro) mb-2">
                    {parecer.titulo}
                  </h4>

                  <p className="text-sm text-(--not-black) leading-relaxed mb-4 whitespace-pre-line">
                    {parecer.conteudo}
                  </p>
                </div>

                <div className="pt-3 border-t border-(--border-light) flex items-center justify-between text-xs text-(--text-gray)">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <FontAwesomeIcon icon={faUserEdit} />
                    {parecer.professorNome}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    {formatarData(parecer.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center text-(--text-gray)">
          <FontAwesomeIcon icon={faBookOpen} size="2x" className="mb-3" />
          <p className="text-lg font-semibold">
            Nenhum parecer pedagógico encontrado para os filtros selecionados.
          </p>
        </div>
      )}

      {/* Modal de Criação / Edição de Parecer */}
      <Modal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        title={
          parecerEditando
            ? 'Editar Parecer Pedagógico'
            : 'Registrar Parecer Pedagógico do Aluno'
        }
      >
        <form onSubmit={handleSalvarParecer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Aluno *
              </label>
              <select
                required
                value={formData.alunoId}
                onChange={(e) =>
                  setFormData({ ...formData, alunoId: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                <option value="">Selecione o aluno...</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome || a.nome_completo}{' '}
                    {a.turma?.nome ? `(${a.turma.nome})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
                Período Avaliativo *
              </label>
              <select
                required
                value={formData.periodo}
                onChange={(e) =>
                  setFormData({ ...formData, periodo: e.target.value })
                }
                className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
              >
                {PERIODOS_OPCOES.map((per) => (
                  <option key={per} value={per}>
                    {per}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Título / Eixo de Desenvolvimento *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Ex: Desenvolvimento Socioemocional, Linguagem e Autonomia"
              className="w-full px-4 py-3 border border-(--border-gray) rounded-lg text-base focus:outline-none focus:border-(--orange)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--azul-escuro) mb-1">
              Parecer Descritivo *
            </label>
            <textarea
              rows="5"
              required
              value={formData.conteudo}
              onChange={(e) =>
                setFormData({ ...formData, conteudo: e.target.value })
              }
              placeholder="Descreva a evolução, interações, habilidades motoras e observações pedagógicas sobre o aluno..."
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
                ? 'Salvando...'
                : parecerEditando
                  ? 'Salvar Alterações'
                  : 'Salvar Parecer'}
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

