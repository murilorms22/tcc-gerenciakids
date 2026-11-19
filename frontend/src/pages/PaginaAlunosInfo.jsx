import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import alunoService from '../services/alunoService';
import { calcularIdade } from './PaginaAlunos';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPhone,
  faMapMarkerAlt,
  faHeartbeat,
  faRulerVertical,
  faWeight,
  faIdCard,
  faExclamationTriangle,
  faNotesMedical,
  faShieldHalved,
  faChalkboardUser,
  faCalendarCheck,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

function PaginaAlunosInfo() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchAluno = async () => {
      try {
        setCarregando(true);
        const dados = await alunoService.buscarPorId(id);
        setAluno(dados);
      } catch (error) {
        console.error(error);
        const msg =
          error.response?.data?.message ||
          'Não foi possível carregar as informações do aluno.';
        setErro(Array.isArray(msg) ? msg.join(' ') : msg);
      } finally {
        setCarregando(false);
      }
    };
    fetchAluno();
  }, [id]);

  if (carregando) {
    return (
      <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black)">
        <h1 className="text-2xl font-bold text-(--azul-escuro)">
          Carregando ficha do aluno...
        </h1>
      </div>
    );
  }

  if (erro || !aluno) {
    return (
      <div className="flex-1 p-8 bg-(--bg-page)">
        <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-xl mx-auto text-center border-t-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            {erro || 'Aluno não encontrado'}
          </h1>
          <Link
            to="/alunos"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-(--orange) text-white rounded-lg font-bold no-underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  const nomeCompleto =
    aluno.nome ||
    aluno.nome_completo ||
    `${aluno.firstName || ''} ${aluno.lastName || ''}`.trim() ||
    'Aluno';

  const fotoUrl =
    aluno.foto_perfil_url ||
    aluno.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeCompleto)}&background=ff7417&color=fff&size=150`;

  const idade =
    aluno.age !== undefined
      ? aluno.age
      : calcularIdade(aluno.data_nascimento || aluno.birthDate);

  const generoFormatado =
    aluno.genero ||
    (aluno.gender === 'male'
      ? 'Masculino'
      : aluno.gender === 'female'
        ? 'Feminino'
        : 'Não informado');

  const enderecoFormatado =
    aluno.endereco ||
    (aluno.address
      ? `${aluno.address.address || ''}, ${aluno.address.city || ''} - ${aluno.address.state || ''}`
      : 'Endereço não cadastrado');

  const tipoSanguineo = aluno.tipo_sanguineo || aluno.bloodGroup || 'N/I';
  const altura = aluno.altura ?? aluno.height ?? null;
  const peso = aluno.peso ?? aluno.weight ?? null;
  const alergias = aluno.alergias || 'Nenhuma';
  const temAlergia = alergias && alergias.toLowerCase() !== 'nenhuma';
  const observacoes =
    aluno.observacoes || 'Sem observações médicas ou pedagógicas adicionais.';
  const faltas = aluno.faltas ?? 0;
  const frequencia = Math.max(0, ((100 - faltas) / 100) * 100).toFixed(1);

  return (
    <div className="flex-1 p-4 md:p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto h-full">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/alunos"
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-(--azul-escuro) hover:bg-(--orange) hover:text-white transition-colors duration-200"
            title="Voltar para lista"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-(--azul-escuro)">
              Ficha do Aluno
            </h1>
            <p className="text-(--text-gray)">
              Detalhes cadastrais, vínculo familiar e ficha médica protegida.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3.5 py-2 rounded-full">
          <FontAwesomeIcon icon={faShieldHalved} />
          Dados Médicos Descriptografados (AES-256-GCM • Acesso Auditado LGPD)
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Coluna Esquerda: Perfil e Frequência */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center text-center border-t-[5px] border-t-(--orange)">
            <div className="relative mb-4">
              <img
                src={fotoUrl}
                alt={nomeCompleto}
                className="w-32 h-32 rounded-full object-cover border-4 border-(--bg-page)"
              />
              <span className="absolute bottom-0 right-0 bg-(--success-green) text-white text-xs font-bold px-2.5 py-1 rounded-full border-2 border-white">
                Ativo
              </span>
            </div>

            <h2 className="text-2xl font-bold text-(--azul-escuro) mb-1">
              {nomeCompleto}
            </h2>
            <p className="text-(--text-gray) text-sm mb-2">
              Matrícula: #{String(aluno.id).padStart(4, '0')}-2026
            </p>

            {aluno.turma && (
              <span className="inline-flex items-center gap-2 bg-orange-100 text-(--dark-orange) text-xs font-bold px-3 py-1 rounded-full mb-6">
                <FontAwesomeIcon icon={faChalkboardUser} />
                {aluno.turma.nome} ({aluno.turma.turno})
              </span>
            )}

            <div className="grid grid-cols-2 gap-4 w-full border-t border-(--border-light) pt-6">
              <div>
                <p className="text-sm text-(--text-gray)">Idade</p>
                <p className="text-xl font-bold text-(--azul-escuro)">
                  {idade} anos
                </p>
              </div>
              <div>
                <p className="text-sm text-(--text-gray)">Gênero</p>
                <p className="text-xl font-bold text-(--azul-escuro)">
                  {generoFormatado}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full border-t border-(--border-light) pt-4 mt-4">
              <div>
                <p className="text-sm text-(--text-gray)">Frequência</p>
                <p className="text-xl font-bold text-green-600">
                  {frequencia}%
                </p>
              </div>
              <div>
                <p className="text-sm text-(--text-gray)">Faltas no Ano</p>
                <p className="text-xl font-bold text-(--azul-escuro)">
                  {faltas}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Alergias/Observações, Saúde e Responsável */}
        <div className="flex flex-col gap-6">
          {/* Card de Alergias e Observações Médicas (LGPD) */}
          <div
            className={`bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[6px] ${
              temAlergia ? 'border-l-red-500' : 'border-l-(--success-green)'
            }`}
          >
            <h3 className="text-xl font-bold text-(--azul-escuro) mb-4 flex items-center gap-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className={temAlergia ? 'text-red-500' : 'text-(--success-green)'}
              />
              Alergias e Restrições Médicas
            </h3>

            <div
              className={`p-4 rounded-lg mb-4 ${
                temAlergia
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}
            >
              <p className="text-xs uppercase font-bold tracking-wider mb-1">
                Quadro Alérgico Registrado:
              </p>
              <p className="text-base font-bold m-0">{alergias}</p>
            </div>

            <div className="p-4 bg-(--bg-gray-light) rounded-lg border border-(--border-light)">
              <p className="text-xs font-bold text-(--text-gray) uppercase tracking-wider mb-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faNotesMedical} /> Observações Clínicas e
                Pedagógicas
              </p>
              <p className="text-sm text-(--not-black) leading-relaxed m-0">
                {observacoes}
              </p>
            </div>
          </div>

          {/* Card de Indicadores Biométricos de Saúde */}
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="text-xl font-bold text-(--azul-escuro) mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faHeartbeat} className="text-red-500" />
              Informações Biométricas e de Saúde
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 border border-(--border-light) rounded-lg">
                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                  {tipoSanguineo}
                </div>
                <div>
                  <p className="text-xs text-(--text-gray)">Tipo Sanguíneo</p>
                  <p className="font-bold text-(--azul-escuro)">
                    {tipoSanguineo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-(--border-light) rounded-lg">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                  <FontAwesomeIcon icon={faRulerVertical} />
                </div>
                <div>
                  <p className="text-xs text-(--text-gray)">Altura</p>
                  <p className="font-bold text-(--azul-escuro)">
                    {altura !== null ? `${altura} cm` : 'Não informada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-(--border-light) rounded-lg">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-500 shrink-0">
                  <FontAwesomeIcon icon={faWeight} />
                </div>
                <div>
                  <p className="text-xs text-(--text-gray)">Peso</p>
                  <p className="font-bold text-(--azul-escuro)">
                    {peso !== null ? `${peso} kg` : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Dados do Responsável e Endereço */}
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="text-xl font-bold text-(--azul-escuro) mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faIdCard} className="text-(--orange)" />
              Dados do Responsável Legal e Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-(--bg-gray-light) rounded-lg">
                <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} /> Responsável Legal
                </p>
                <p className="font-semibold text-(--not-black)">
                  {aluno.responsavel?.nome || 'Não vinculado'}
                </p>
                {aluno.responsavel?.cpf && (
                  <p className="text-xs text-(--text-gray) mt-0.5">
                    CPF: {aluno.responsavel.cpf}
                  </p>
                )}
              </div>

              <div className="p-4 bg-(--bg-gray-light) rounded-lg">
                <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} /> Telefone de Emergência
                </p>
                <p className="font-semibold text-(--not-black)">
                  {aluno.responsavel?.telefone ||
                    aluno.phone ||
                    'Não informado'}
                </p>
              </div>

              <div className="p-4 bg-(--bg-gray-light) rounded-lg">
                <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarCheck} /> Data de Nascimento
                </p>
                <p className="font-semibold text-(--not-black)">
                  {aluno.data_nascimento || 'Não informada'}
                </p>
              </div>

              <div className="p-4 bg-(--bg-gray-light) rounded-lg">
                <p className="text-sm text-(--text-gray) mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Endereço Residencial
                </p>
                <p className="font-semibold text-(--not-black)">
                  {enderecoFormatado}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaginaAlunosInfo;
