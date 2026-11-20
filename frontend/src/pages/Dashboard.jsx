import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faUsers,
  faBell,
  faArrowRight,
  faShieldHalved,
  faClipboardCheck,
  faExclamationTriangle,
  faChalkboardUser,
} from '@fortawesome/free-solid-svg-icons';
import BotaoLaranja from '../components/BotaoLaranja';
import CardGrande from '../components/CardGrande';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import alunoService from '../services/alunoService';
import atividadeService from '../services/atividadeService';
import avisoService from '../services/avisoService';
import turmaService from '../services/turmaService';

function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'PROFESSOR';
  const isAdminOrDirecao = role === 'ADMIN' || role === 'DIRECAO';
  const isResponsavel = role === 'RESPONSAVEL';

  const [alunos, setAlunos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        const [alunosData, atividadesData, avisosData, turmasData] =
          await Promise.all([
            alunoService.listar(),
            atividadeService.listar(),
            avisoService.listar(),
            turmaService.listar(),
          ]);

        setAlunos(Array.isArray(alunosData) ? alunosData : []);
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
        setAvisos(Array.isArray(avisosData) ? avisosData : []);

        const atividadesFormatadas = (
          Array.isArray(atividadesData) ? atividadesData : []
        )
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            titulo: `${item.titulo}${item.turma?.nome ? ` (${item.turma.nome})` : ''}`,
            horario: item.horario || '08:00',
            numeroSala: item.sala || 'Sala 1',
          }));

        setAtividades(atividadesFormatadas);
      } catch (error) {
        console.error(error);
        setErro('Erro ao carregar dados do painel escolar.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  if (carregando) {
    return (
      <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto">
        <h1 className="text-2xl font-bold text-(--azul-escuro)">
          Carregando painel...
        </h1>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex-1 p-8 bg-(--bg-page) text-red-600 overflow-y-auto">
        <h1 className="text-2xl font-bold">{erro}</h1>
      </div>
    );
  }

  const avisosPublicados = avisos.filter(
    (av) => !av.status || av.status === 'APROVADO',
  );
  const avisosUrgentes = avisosPublicados.filter(
    (av) => av.prioridade === 'URGENTE',
  );

  const subtituloPorPerfil = () => {
    if (isAdminOrDirecao) {
      return `Painel de Gestão Escolar e Conformidade LGPD — EMEI Sonho de Criança (${turmas.length} turmas ativas).`;
    }
    if (isResponsavel) {
      return 'Acompanhamento escolar, ficha de saúde e comunicados dos seus filhos.';
    }
    return `Painel pedagógico e controle de frequência (${turmas.map((t) => t.nome).join(' • ') || 'EMEI Sonho de Criança'}).`;
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-(--azul-escuro)">
            Bem-vindo(a), {user?.nome || user?.firstName || 'Educador'}!
          </h1>
          <p className="text-base text-(--text-gray)">{subtituloPorPerfil()}</p>
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

      {/* KPIs Reais Adaptados por Perfil */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NavLink to="/alunos" className="no-underline">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent) hover:translate-y-[-2px] transition-transform">
            <h3 className="text-sm font-semibold text-(--text-gray) mb-2">
              {isResponsavel ? 'Filhos Vinculados' : 'Total de Alunos'}
            </h3>
            <p className="text-4xl font-bold text-(--azul-escuro)">
              {alunos.length}
            </p>
          </div>
        </NavLink>

        <NavLink to="/avisos" className="no-underline">
          <div className="relative bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent) hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-(--text-gray) m-0">
                Avisos no Mural
              </h3>
              <span
                className="inline-flex items-center gap-1 text-sm font-bold text-(--orange)"
                title={`${avisosUrgentes.length} aviso(s) urgente(s)`}
              >
                <span>{avisosUrgentes.length}</span>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </span>
            </div>
            <p className="text-4xl font-bold text-(--azul-escuro)">
              {avisosPublicados.length}
            </p>
          </div>
        </NavLink>

        <NavLink
          to={isAdminOrDirecao ? '/admin/turmas' : '/agenda'}
          className="no-underline"
        >
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent) hover:translate-y-[-2px] transition-transform">
            <h3 className="text-sm font-semibold text-(--text-gray) mb-2">
              Turmas Ativas (2026)
            </h3>
            <p className="text-4xl font-bold text-(--azul-escuro)">
              {turmas.length}
            </p>
          </div>
        </NavLink>
      </section>

      {/* Seção dedicada ao RESPONSAVEL com resumo rápido dos filhos vinculados */}
      {isResponsavel && alunos.length > 0 && (
        <section className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-bold text-(--azul-escuro) mb-4">
              Meus Filhos Matriculados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alunos.map((filho) => (
                <NavLink
                  key={filho.id}
                  to={`/alunos/${filho.id}`}
                  className="no-underline p-4 rounded-xl border border-(--border-gray) hover:border-(--orange) bg-(--bg-gray-light) flex items-center gap-4 transition-colors"
                >
                  <img
                    src={
                      filho.foto_perfil_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(filho.nome)}&background=ff7417&color=fff`
                    }
                    alt={filho.nome}
                    className="w-12 h-12 rounded-full object-cover border-2 border-(--orange)"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-(--azul-escuro) truncate">
                      {filho.nome}
                    </p>
                    <p className="text-xs text-(--text-gray)">
                      {filho.turma?.nome || 'Turma'} • {filho.faltas} falta(s)
                    </p>
                    {filho.alergias &&
                      filho.alergias.toLowerCase() !== 'nenhuma' && (
                        <p className="text-xs text-(--orange) font-semibold truncate mt-0.5">
                          <FontAwesomeIcon icon={faExclamationTriangle} />{' '}
                          {filho.alergias}
                        </p>
                      )}
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </section>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <NavLink to="/agenda" className="no-underline group">
              <CardGrande
                titulo="Atividades Programadas"
                atividades={atividades}
              />

              <div className="flex justify-end mt-2 pr-2">
                <span className="text-(--orange) font-bold flex items-center gap-2 group-hover:underline cursor-pointer -translate-y-12 -translate-x-3">
                  Ver agenda completa <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </div>
            </NavLink>
          </div>

          {/* Últimos Avisos do Mural */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-(--azul-escuro)">
                Comunicados Recentes
              </h2>
              <NavLink
                to="/avisos"
                className="text-sm font-bold text-(--orange) no-underline hover:underline"
              >
                Ver mural completo
              </NavLink>
            </div>
            <div className="space-y-3">
              {avisosPublicados.slice(0, 3).map((aviso) => (
                <div
                  key={aviso.id}
                  className="p-4 rounded-lg bg-(--bg-gray-light) border border-(--border-light)"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-(--azul-escuro)">
                      {aviso.titulo}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        aviso.prioridade === 'URGENTE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-(--dark-orange)'
                      }`}
                    >
                      {aviso.prioridade}
                    </span>
                  </div>
                  <p className="text-sm text-(--text-gray) line-clamp-2">
                    {aviso.conteudo}
                  </p>
                </div>
              ))}
              {avisosPublicados.length === 0 && (
                <p className="text-sm text-(--text-gray)">
                  Nenhum comunicado publicado até o momento.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
            <h2 className="text-xl font-bold mb-4 text-(--azul-escuro)">
              Ações Rápidas ({role})
            </h2>
            <div className="flex flex-col gap-4">
              <NavLink to="/alunos" className="no-underline">
                <BotaoLaranja
                  mensagem={
                    isResponsavel ? 'Ver Ficha dos Filhos' : 'Consultar Alunos'
                  }
                  icone={faUsers}
                />
              </NavLink>

              <NavLink to="/avisos" className="no-underline">
                <BotaoLaranja
                  mensagem={
                    isResponsavel ? 'Mural de Avisos' : 'Publicar / Ver Avisos'
                  }
                  icone={faBell}
                />
              </NavLink>

              {!isResponsavel && (
                <NavLink to="/chamada" className="no-underline">
                  <BotaoLaranja
                    mensagem="Registrar Chamada"
                    icone={faClipboardCheck}
                  />
                </NavLink>
              )}

              {isAdminOrDirecao && (
                <>
                  <NavLink to="/admin/alunos" className="no-underline">
                    <BotaoLaranja
                      mensagem="Secretaria: Alunos"
                      icone={faPlus}
                    />
                  </NavLink>
                  <NavLink to="/admin/turmas" className="no-underline">
                    <BotaoLaranja
                      mensagem="Turmas e Responsáveis"
                      icone={faChalkboardUser}
                    />
                  </NavLink>
                  <NavLink to="/admin/auditoria" className="no-underline">
                    <BotaoLaranja
                      mensagem="Auditoria LGPD"
                      icone={faShieldHalved}
                    />
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
