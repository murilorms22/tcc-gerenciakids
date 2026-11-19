import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSave,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import alunoService from '../services/alunoService';
import turmaService from '../services/turmaService';

function PaginaChamada() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [sortConfig] = useState({
    key: 'nome_completo',
    direction: 'ascending',
  });

  const [listaDeAusentes, setListaDeAusentes] = useState(new Set());
  const [salvando, setSalvando] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState('');

  const [totalAulas] = useState(100);

  const calcularFrequencia = (faltas) => {
    if (totalAulas === 0) return '100.0';
    const presencas = totalAulas - (faltas || 0);
    const percentualFrequencia = (presencas / totalAulas) * 100;
    return Math.max(0, percentualFrequencia).toFixed(1);
  };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        const [alunosData, turmasData] = await Promise.all([
          alunoService.listar(),
          turmaService.listar(),
        ]);

        setTurmas(Array.isArray(turmasData) ? turmasData : []);

        const dadosAdaptados = (
          Array.isArray(alunosData) ? alunosData : []
        ).map((aluno) => {
          const nome = aluno.nome || aluno.nome_completo || 'Aluno';
          return {
            ...aluno,
            nome_completo: nome,
            foto_perfil_url:
              aluno.foto_perfil_url ||
              aluno.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ff7417&color=fff`,
          };
        });

        setAlunos(dadosAdaptados);
      } catch (err) {
        setErro('Falha ao buscar a lista de chamada.');
        console.error(err);
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

    alunosProcessados.sort((a, b) => {
      const valA = a.nome_completo.toLowerCase();
      const valB = b.nome_completo.toLowerCase();
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setAlunosFiltrados(alunosProcessados);
  }, [alunos, termoPesquisa, turmaSelecionada, sortConfig]);

  const handleAusenciaToggle = (alunoId) => {
    setListaDeAusentes((prevAusentes) => {
      const novosAusentes = new Set(prevAusentes);
      if (novosAusentes.has(alunoId)) {
        novosAusentes.delete(alunoId);
      } else {
        novosAusentes.add(alunoId);
      }
      return novosAusentes;
    });
  };

  const handleSubmitChamada = async () => {
    if (listaDeAusentes.size === 0) {
      setMensagemFeedback(
        'Chamada confirmada: todos os alunos presentes hoje (0 faltas adicionadas).',
      );
      return;
    }

    setSalvando(true);
    setMensagemFeedback('');

    const alunosAusentes = alunos.filter((aluno) =>
      listaDeAusentes.has(aluno.id),
    );

    const promises = alunosAusentes.map((aluno) =>
      alunoService.registrarChamada(aluno.id, { incrementar: true }),
    );

    try {
      await Promise.all(promises);

      const novaListaAlunos = alunos.map((aluno) => {
        if (listaDeAusentes.has(aluno.id)) {
          return { ...aluno, faltas: (aluno.faltas || 0) + 1 };
        }
        return aluno;
      });

      setAlunos(novaListaAlunos);
      setMensagemFeedback(
        `${promises.length} falta(s) registrada(s) com sucesso na API e auditadas!`,
      );
      setListaDeAusentes(new Set());
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setMensagemFeedback('Erro ao registrar chamada na API.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando)
    return (
      <h1 className="p-8 text-center text-(--text-gray)">
        Carregando lista de chamada...
      </h1>
    );
  if (erro)
    return <h1 className="p-8 text-center text-red-500">Erro: {erro}</h1>;

  return (
    <div className="w-full p-4 md:p-8">
      <header className="mb-6 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
          title="Voltar ao painel"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <div>
          <h1 className="text-(--azul-escuro) text-3xl md:text-4xl font-bold">
            Registro de Chamada
          </h1>
          <p className="text-base md:text-lg text-(--text-gray) mt-1">
            Marque os alunos que FALTARAM hoje para atualizar a frequência da
            turma.
          </p>
        </div>
      </header>

      {mensagemFeedback && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 font-semibold">
          {mensagemFeedback}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
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
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] items-center py-5 px-6 gap-4 bg-(--bg-gray-light) font-bold text-(--text-gray) border-b border-(--border-gray)">
          <div>Nome Completo</div>
          <div>Turma</div>
          <div className="text-center">Faltas Acumuladas</div>
          <div className="text-center">Frequência</div>
          <div className="text-center">Ausente Hoje?</div>
        </div>

        <div>
          {alunosFiltrados.length > 0 ? (
            alunosFiltrados.map((aluno) => {
              const frequencia = calcularFrequencia(aluno.faltas);
              const frequenciaNum = parseFloat(frequencia);

              return (
                <div
                  className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] items-center py-4 px-6 gap-4 border-b border-(--border-light) last:border-b-0 hover:bg-gray-50"
                  key={aluno.id}
                >
                  <div className="font-bold text-(--azul-escuro) flex items-center gap-4">
                    <img
                      src={aluno.foto_perfil_url}
                      alt={aluno.nome_completo}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <span className="truncate">{aluno.nome_completo}</span>
                  </div>
                  <div className="text-sm text-(--text-gray) font-medium">
                    {aluno.turma?.nome || 'Turma'}
                  </div>
                  <div className="text-center">
                    <span className="bg-(--bg-gray-light) text-(--azul-escuro) py-1 px-3 rounded-lg font-bold">
                      {aluno.faltas ?? 0}
                    </span>
                  </div>
                  <div className="text-center">
                    <span
                      className={`py-1 px-3 rounded-lg font-bold ${
                        frequenciaNum >= 75
                          ? 'bg-green-100 text-green-700'
                          : frequenciaNum >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {frequencia}%
                    </span>
                  </div>
                  <div className="text-center flex justify-center">
                    <input
                      type="checkbox"
                      aria-label={`Marcar ausência de ${aluno.nome_completo}`}
                      className="w-6 h-6 cursor-pointer custom-checkbox"
                      checked={listaDeAusentes.has(aluno.id)}
                      onChange={() => handleAusenciaToggle(aluno.id)}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-(--text-gray)">
              Nenhum aluno encontrado.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="bg-(--success-green) text-white border-none py-3 px-6 rounded-lg text-lg font-bold cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-(--success-green-hover) disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleSubmitChamada}
          disabled={salvando}
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{salvando ? 'Salvando...' : 'Salvar Chamada'}</span>
        </button>
      </div>
    </div>
  );
}

export default PaginaChamada;
