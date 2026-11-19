import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faSync,
  faSearch,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import auditService from '../../services/auditService';

export default function PaginaAuditoria() {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroEntidade, setFiltroEntidade] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  const carregarLogs = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await auditService.listar({
        ...(filtroEntidade ? { entidade: filtroEntidade } : {}),
        ...(filtroAcao ? { acao: filtroAcao } : {}),
      });
      setLogs(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error(err);
      setErro(
        err.response?.data?.message ||
          'Falha ao carregar os registros de auditoria LGPD.',
      );
    } finally {
      setCarregando(false);
    }
  }, [filtroEntidade, filtroAcao]);

  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);

  const logsFiltrados = logs.filter((log) => {
    if (!termoBusca) return true;
    const termo = termoBusca.toLowerCase();
    return (
      (log.userEmail || '').toLowerCase().includes(termo) ||
      (log.detalhes || '').toLowerCase().includes(termo) ||
      (log.acao || '').toLowerCase().includes(termo) ||
      (log.entidade || '').toLowerCase().includes(termo)
    );
  });

  const badgeAcao = (acao) => {
    switch (acao) {
      case 'READ_FICHA_MEDICA':
        return 'bg-purple-100 text-purple-800';
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
      case 'UPDATE_CHAMADA':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-(--dark-orange)';
    }
  };

  const formatarDataHora = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-(--azul-escuro) flex items-center gap-3">
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-(--orange)"
            />
            Trilha de Auditoria e Conformidade LGPD
          </h1>
          <p className="text-sm text-(--text-gray) mt-1">
            Registro imutável de acessos a fichas médicas de crianças (Art. 14 e
            Art. 37 da LGPD) e operações administrativas.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarLogs}
          disabled={carregando}
          className="bg-(--azul-escuro) text-white px-5 py-3 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2 hover:bg-(--azul-claro) border-none self-start"
        >
          <FontAwesomeIcon
            icon={faSync}
            className={carregando ? 'animate-spin' : ''}
          />
          <span>Atualizar Logs</span>
        </button>
      </header>

      {/* Banner de Conformidade */}
      <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange) mb-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-100 text-(--orange) flex items-center justify-center shrink-0 mt-0.5">
          <FontAwesomeIcon icon={faLock} />
        </div>
        <div className="text-sm">
          <p className="font-bold text-(--azul-escuro) m-0">
            Monitoramento Ativo via AuditInterceptor + AES-256-GCM
          </p>
          <p className="text-(--text-gray) m-0 mt-1">
            Toda leitura individual de ficha médica (
            <code>GET /alunos/:id</code>), registro de frequência, criação,
            edição ou exclusão é vinculada ao usuário autenticado e gravada
            automaticamente na tabela <code>audit_logs</code>.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative grow min-w-[240px]">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-gray)"
          />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Filtrar por e-mail do usuário ou detalhes..."
            className="w-full py-3 px-4 pl-10 rounded-lg border border-(--border-gray) bg-white text-base"
          />
        </div>

        <select
          value={filtroEntidade}
          onChange={(e) => setFiltroEntidade(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todas as entidades</option>
          <option value="Aluno">Aluno (Fichas Médicas)</option>
          <option value="Turma">Turma</option>
          <option value="Responsavel">Responsável</option>
          <option value="Atividade">Atividade</option>
          <option value="Aviso">Aviso</option>
          <option value="User">Usuário</option>
        </select>

        <select
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          className="py-3 px-4 rounded-lg border border-(--border-gray) bg-white text-base text-(--azul-escuro)"
        >
          <option value="">Todas as ações</option>
          <option value="READ_FICHA_MEDICA">
            Leitura de Ficha Médica (LGPD)
          </option>
          <option value="CREATE">Criação (CREATE)</option>
          <option value="UPDATE">Atualização (UPDATE)</option>
          <option value="UPDATE_CHAMADA">Chamada (UPDATE_CHAMADA)</option>
          <option value="DELETE">Exclusão (DELETE)</option>
        </select>
      </div>

      {erro ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl font-semibold">
          {erro}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-(--bg-gray-light)">
              <tr className="border-b border-(--border-gray)">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-(--text-gray)">
                  Data / Hora
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-(--text-gray)">
                  Usuário / Perfil
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-(--text-gray)">
                  Ação
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-(--text-gray)">
                  Entidade
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-(--text-gray)">
                  Detalhes da Operação
                </th>
              </tr>
            </thead>
            <tbody>
              {logsFiltrados.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-(--border-light) last:border-b-0 hover:bg-(--bg-gray-light) text-sm"
                >
                  <td className="px-5 py-4 whitespace-nowrap text-(--text-gray) font-medium">
                    {formatarDataHora(log.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-(--azul-escuro) m-0">
                      {log.userEmail || 'Sistema'}
                    </p>
                    {log.userRole && (
                      <span className="text-[11px] font-bold uppercase text-(--orange)">
                        {log.userRole}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeAcao(
                        log.acao,
                      )}`}
                    >
                      {log.acao}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-(--azul-escuro)">
                    {log.entidade}
                    {log.entidadeId ? ` #${log.entidadeId}` : ''}
                  </td>
                  <td className="px-5 py-4 text-(--not-black)">
                    {log.detalhes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!carregando && logsFiltrados.length === 0 && (
            <div className="p-8 text-center text-(--text-gray)">
              Nenhum registro de auditoria encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

