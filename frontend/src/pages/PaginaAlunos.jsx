import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faExclamationTriangle,
  faPlus,
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import alunoService from '../services/alunoService';
import turmaService from '../services/turmaService';
import { useAuth } from '../contexts/AuthContext';

export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  if (isNaN(nascimento.getTime())) return 0;
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const meses = hoje.getMonth() - nascimento.getMonth();
  if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
    anos--;
  }
  return Math.max(0, anos);
}

function PaginaAlunos() {
  const { user } = useAuth();
  const role = user?.role || 'PROFESSOR';
  const isResponsavel = role === 'RESPONSAVEL';

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [mostrarApenasAlergicos, setMostrarApenasAlergicos] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'nome_completo',
    direction: 'ascending',
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        const [alunosData, turmasData] = await Promise.all([
          alunoService.listar(),
          turmaService.listar(),
        ]);

        setTurmas(Array.isArray(turmasData) ? turmasData : []);

        const lista = (Array.isArray(alunosData) ? alunosData : []).map(
          (item) => {
            const nome = item.nome || item.nome_completo || 'Aluno';
            return {
              id: item.id,
              nome_completo: nome,
              data_nascimento: item.data_nascimento,
              alergias: item.alergias || 'Nenhuma',
              turmaId: item.turmaId,
              turmaNome: item.turma?.nome || 'Turma Regular',
              foto:
                item.foto_perfil_url ||
                item.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ff7417&color=fff`,
            };
          },
        );

        setAlunos(lista);
      } catch (err) {
        console.error(err);
        setErro('Falha ao buscar a lista de alunos.');
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, []);

  useEffect(() => {
    let alunosProcessados = [...alunos];

    if (termoPesquisa) {
      alunosProcessados = alunosProcessados.filter((aluno) =>
        aluno.nome_completo.toLowerCase().includes(termoPesquisa.toLowerCase()),
      );
    }

    if (turmaSelecionada) {
      alunosProcessados = alunosProcessados.filter(
        (aluno) => String(aluno.turmaId) === String(turmaSelecionada),
      );
    }

    if (mostrarApenasAlergicos) {
      alunosProcessados = alunosProcessados.filter(
        (aluno) =>
          aluno.alergias && aluno.alergias.toLowerCase() !== 'nenhuma',
      );
    }

    if (sortConfig.key !== null) {
      alunosProcessados.sort((a, b) => {
        let valA, valB;

        switch (sortConfig.key) {
          case 'nome_completo':
            valA = a.nome_completo.toLowerCase();
            valB = b.nome_completo.toLowerCase();
            break;

          case 'data_nascimento':
            valA = new Date(a.data_nascimento);
            valB = new Date(b.data_nascimento);
            break;

          case 'alergias':
            valA =
              a.alergias && a.alergias.toLowerCase() !== 'nenhuma' ? 1 : 0;
            valB =
              b.alergias && b.alergias.toLowerCase() !== 'nenhuma' ? 1 : 0;
            break;

          default:
            valA = a[sortConfig.key];
            valB = b[sortConfig.key];
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (sortConfig.key !== 'nome_completo') {
          const nomeA = a.nome_completo.toLowerCase();
          const nomeB = b.nome_completo.toLowerCase();
          if (nomeA < nomeB) return -1;
          if (nomeA > nomeB) return 1;
        }

        return 0;
      });
    }

    setAlunosFiltrados(alunosProcessados);
  }, [
    alunos,
    termoPesquisa,
    turmaSelecionada,
    mostrarApenasAlergicos,
    sortConfig,
  ]);

  const handleSort = (key) => {
    let direction = 'ascending';

    if (sortConfig.key === key) {
      direction =
        sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    } else if (key === 'alergias' || key === 'data_nascimento') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    if (sortConfig.direction === 'ascending') return faSortUp;
    return faSortDown;
  };

  if (carregando)
    return (
      <h1 className="p-8 text-center text-(--text-gray)">
        Carregando lista de alunos...
      </h1>
    );
  if (erro)
    return <h1 className="p-8 text-center text-red-500">Erro: {erro}</h1>;

  return (
    <div className="w-full p-4 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-row items-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
            title="Voltar ao painel"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-(--azul-escuro)">
              {isResponsavel ? 'Meus Filhos' : 'Gerenciamento de Alunos'}
            </h1>
            {isResponsavel && (
              <p className="text-sm text-(--text-gray)">
                Visualização filtrada por vínculo familiar (Proteção LGPD)
              </p>
            )}
          </div>
        </div>

        {!isResponsavel && (
          <NavLink to="/chamada" className="no-underline">
            <button className="flex items-center justify-center gap-3 p-4 bg-(--orange) text-white border-none rounded-lg text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-(--light-orange)">
              <FontAwesomeIcon icon={faPlus} />
              <span>Realizar chamada</span>
            </button>
          </NavLink>
        )}
      </header>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="relative grow min-w-[240px]">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)"
          />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) bg-white text-base"
          />
        </div>

        <select
          value={turmaSelecionada}
          onChange={(e) => setTurmaSelecionada(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todas as turmas</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} ({t.turno})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm text-(--not-black)">
          <input
            type="checkbox"
            id="filtroAlergia"
            className="custom-checkbox mr-2"
            checked={mostrarApenasAlergicos}
            onChange={(e) => setMostrarApenasAlergicos(e.target.checked)}
          />
          <label htmlFor="filtroAlergia" className="cursor-pointer">
            Mostrar apenas alunos com alergia
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-[2.5fr_1.5fr_1fr_2fr_0.8fr] items-center p-4 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray) rounded-t-xl">
          <div
            className="cursor-pointer transition-colors duration-200 flex items-center gap-2 hover:text-(--azul-escuro)"
            onClick={() => handleSort('nome_completo')}
          >
            Nome Completo <FontAwesomeIcon icon={getSortIcon('nome_completo')} />
          </div>
          <div>Turma</div>
          <div
            className="cursor-pointer transition-colors duration-200 flex items-center gap-2 hover:text-(--azul-escuro)"
            onClick={() => handleSort('data_nascimento')}
          >
            Idade <FontAwesomeIcon icon={getSortIcon('data_nascimento')} />
          </div>
          <div
            className="cursor-pointer transition-colors duration-200 flex items-center gap-2 hover:text-(--azul-escuro)"
            onClick={() => handleSort('alergias')}
          >
            Alertas Médicos <FontAwesomeIcon icon={getSortIcon('alergias')} />
          </div>
          <div className="text-right">Ações</div>
        </div>

        <div>
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map((aluno) => (
              <div
                className="grid grid-cols-[2.5fr_1.5fr_1fr_2fr_0.8fr] items-center p-4 px-6 gap-4 border-b border-(--border-light) last:border-b-0 last:rounded-b-xl hover:bg-gray-50 transition-colors"
                key={aluno.id}
              >
                <div className="font-bold text-(--azul-escuro) flex items-center gap-3">
                  <img
                    src={aluno.foto}
                    alt={aluno.nome_completo}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                  <span className="truncate">{aluno.nome_completo}</span>
                </div>
                <div className="text-sm text-(--text-gray) font-medium">
                  {aluno.turmaNome}
                </div>
                <div>{calcularIdade(aluno.data_nascimento)} anos</div>
                <div>
                  {aluno.alergias &&
                  aluno.alergias.toLowerCase() !== 'nenhuma' ? (
                    <div
                      className="relative inline-flex items-center group cursor-pointer"
                      title={aluno.alergias}
                      aria-label={`Alerta médico: ${aluno.alergias}`}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-(--orange) text-lg">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      </span>
                      <div className="pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-max max-w-xs px-3 py-2 rounded-lg bg-(--azul-escuro) text-white text-xs font-medium shadow-lg">
                        {aluno.alergias}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-(--azul-escuro)" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-(--text-gray) text-sm">Nenhuma</span>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Link
                    to={`/alunos/${aluno.id}`}
                    className="bg-transparent border-none cursor-pointer text-lg p-2 rounded-full w-[35px] h-[35px] flex items-center justify-center transition-colors duration-200 text-(--azul-escuro) hover:bg-(--border-light)"
                    title="Ver ficha completa"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-(--text-gray)">
              Nenhum aluno encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaginaAlunos;
