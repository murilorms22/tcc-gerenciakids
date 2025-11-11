import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import BotaoLaranja from '../BotaoLaranja/BotaoLaranja';
import CardGrande from '../CardGrande/CardGrande';
import { NavLink } from 'react-router-dom';

const atividadesDoDia = [
    { id: 1, titulo: "Reunião com pais", horario: "15h", numeroSala: 3 },
    { id: 2, titulo: "Dia do brinquedo", horario: "16h", numeroSala: 2 },
    { id: 3, titulo: "Hora do conto", horario: "10h", numeroSala: 1 }
];

function Dashboard() {
  const [professor, setProfessor] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [turma, setTurma] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [profResponse, alunosResponse, turmaResponse] = await Promise.all([
          fetch('http://localhost:3001/professores'), 
          fetch('http://localhost:3001/alunos'), 
          fetch('http://localhost:3001/turma'), 
          ]);

        if (!profResponse.ok || !alunosResponse.ok || !turmaResponse.ok) {
          throw new Error('Falha ao buscar dados da API');
        }

        const profDataArray = await profResponse.json();
        const alunosData = await alunosResponse.json();
        const turmaData = await turmaResponse.json();

        if (profDataArray.length > 0) {
            setProfessor(profDataArray[0]); 
        }

        setAlunos(alunosData);
        setTurma(turmaData);

      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  if (carregando) {
    return <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto"><h1>Carregando informações...</h1></div>;
  }

  if (erro) {
    return <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto"><h1>Erro: {erro}</h1></div>;
  }

  return (
    <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto">
      <header className="flex flex-row justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-(--azul-escuro)">Bem-vindo, Professor {professor.nome}!</h1>
          <p className="text-base text-(--text-gray) mb-8">Painel de controle da turma {turma.nome_turma}.</p>
        </div>
        <NavLink to="/chamada" className="no-underline">
          <button className="flex items-center justify-center gap-3 p-4 bg-(--orange) text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 ml-10 hover:bg-(--light-orange)">
            <FontAwesomeIcon icon={faPlus} />
            <span>Realizar chamada</span>
          </button>
        </NavLink>
      </header>

      {/* SEÇÃO DE RESUMO AGORA PREENCHIDA */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-8">
        <NavLink to="/alunos" className="no-underline">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent)">
            <h3 className="text-base text-(--text-gray) mb-2">Alunos na Turma</h3>
            <p className="text-4xl font-bold text-(--azul-escuro)">{alunos.length}</p>
          </div>
        </NavLink>
        <NavLink to="/avisos" className="no-underline">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent)">
            <h3 className="text-base text-(--text-gray) mb-2">Novos Avisos</h3>
            <p className="text-4xl font-bold text-(--azul-escuro)">3</p> {/* Valor fixo por enquanto */}
          </div>
        </NavLink>
        <NavLink to="/mensagens" className="no-underline">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent)">
            <h3 className="text-base text-(--text-gray) mb-2">Mensagens</h3>
            <p className="text-4xl font-bold text-(--azul-escuro)">5 não lidas</p> {/* Valor fixo por enquanto */}
          </div>
        </NavLink>
      </section>

      <main className="flex gap-8">
        <div className="flex-3 flex flex-col gap-8">
          <NavLink to="/agenda" className="no-underline">
            <CardGrande titulo="Atividades do dia" atividades={atividadesDoDia} />
          </NavLink>
        </div>
        <div className="flex-1">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
            <h2 className="mb-4 text-(--azul-escuro)">Ações Rápidas</h2>
            <div className="flex flex-col gap-4">
              <NavLink to="/avisos" className="no-underline">
                <BotaoLaranja mensagem="Criar aviso" icone={faPlus} />
              </NavLink>
              <NavLink to="/alunos" className="no-underline">
                <BotaoLaranja mensagem="Gerenciar Alunos" icone={faUsers} />
              </NavLink>
              <NavLink to="/mensagens" className="no-underline">
                <BotaoLaranja mensagem="Ler Mensagens" icone={faEnvelopeOpenText} />
              </NavLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;