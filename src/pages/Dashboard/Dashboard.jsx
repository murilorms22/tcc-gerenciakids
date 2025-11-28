import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faEnvelopeOpenText, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import BotaoLaranja from '../../components/BotaoLaranja/BotaoLaranja';
import CardGrande from '../../components/CardGrande/CardGrande';
import { NavLink } from 'react-router-dom';

import axiosClient from '../../utils/axios-client';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { user } = useAuth(); 
  
  const [alunos, setAlunos] = useState([]);
  const [atividades, setAtividades] = useState([]); // Novo estado para as atividades
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Turma simulada
  const turma = { nome_turma: "Maternal II" };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Usamos Promise.all para buscar Alunos E Atividades (Todos) em paralelo
        const [alunosResponse, todosResponse] = await Promise.all([
          axiosClient.get('/users'),
          axiosClient.get('/todos')
        ]);
        
        setAlunos(alunosResponse.data.users);

        // --- ADAPTAÇÃO DAS ATIVIDADES ---
        // 1. Pegamos apenas as 3 primeiras tarefas
        // 2. Mapeamos para o formato que o CardGrande exige (titulo, horario, sala)
        const atividadesRecentes = todosResponse.data.todos.slice(0, 3).map((todo, index) => ({
            id: todo.id,
            titulo: todo.todo,
            // Simulamos horários sequenciais (8h, 10h, 13h...)
            horario: `${8 + (index * 2)}h00`, 
            // Simulamos uma sala aleatória entre 1 e 5
            numeroSala: Math.floor(Math.random() * 5) + 1 
        }));

        setAtividades(atividadesRecentes);

      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar dados do painel.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  if (carregando) {
    return <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto"><h1>Carregando painel...</h1></div>;
  }

  if (erro) {
    return <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto"><h1>{erro}</h1></div>;
  }

  return (
    <div className="flex-1 p-8 bg-(--bg-page) text-(--not-black) overflow-y-auto">
      <header className="flex flex-row justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-(--azul-escuro)">
            Bem-vindo(a), {user ? user.firstName : 'Professor'}!
          </h1>
          <p className="text-base text-(--text-gray) mb-8">Painel de controle da turma {turma.nome_turma}.</p>
        </div>
        
        <NavLink to="/chamada" className="no-underline">
          <button className="flex items-center justify-center gap-3 p-4 bg-(--orange) text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 ml-10 hover:bg-(--light-orange)">
            <FontAwesomeIcon icon={faPlus} />
            <span>Realizar chamada</span>
          </button>
        </NavLink>
      </header>

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
            <p className="text-4xl font-bold text-(--azul-escuro)">3</p>
          </div>
        </NavLink>
        <NavLink to="/mensagens" className="no-underline">
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[5px] border-l-(--orange-accent)">
            <h3 className="text-base text-(--text-gray) mb-2">Mensagens</h3>
            <p className="text-4xl font-bold text-(--azul-escuro)">5 não lidas</p>
          </div>
        </NavLink>
      </section>

      <main className="flex gap-8">
        <div className="flex-3 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <NavLink to="/agenda" className="no-underline group"> 
                <CardGrande titulo="Atividades do dia" atividades={atividades} />
                
                <div className="flex justify-end mt-2 pr-2">
                    <span className="text-(--orange) font-bold flex items-center gap-2 group-hover:underline cursor-pointer -translate-y-12 -translate-x-3">
                        Ver mais atividades <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                </div>
            </NavLink>
          </div>
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