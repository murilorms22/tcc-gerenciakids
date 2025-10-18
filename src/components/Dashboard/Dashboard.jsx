import React, { useState, useEffect } from 'react';
import './Dashboard.css';
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
          fetch('http://localhost:3001/turma')
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
    return <div className="painel-container"><h1>Carregando informações...</h1></div>;
  }
  
  if (erro) {
    return <div className="painel-container"><h1>Erro: {erro}</h1></div>;
  }

  return (
    <div className="painel-container">
      <header className="painel-cabecalho">
        <div>
          <h1>Bem-vindo, Professor {professor.nome}!</h1>
          <p>Painel de controle da turma {turma.nome_turma}.</p>
        </div>
        <NavLink to="/chamada" className="navlink">
          <button className="fazer-chamada">
            <FontAwesomeIcon icon={faPlus} />
            <span>Realizar chamada</span>
          </button>
        </NavLink>
      </header>

      {/* SEÇÃO DE RESUMO AGORA PREENCHIDA */}
      <section className="painel-resumo">
        <NavLink to="/alunos" className="navlink">
          <div className="cartao-resumo">
            <h3>Alunos na Turma</h3>
            <p className="valor-resumo">{alunos.length}</p>
          </div>
        </NavLink>
        <NavLink to="/avisos" className="navlink">
          <div className="cartao-resumo">
            <h3>Novos Avisos</h3>
            <p className="valor-resumo">3</p> {/* Valor fixo por enquanto */}
          </div>
        </NavLink>
        <NavLink to="/mensagens" className="navlink">
          <div className="cartao-resumo">
            <h3>Mensagens</h3>
            <p className="valor-resumo">5 não lidas</p> {/* Valor fixo por enquanto */}
          </div>
        </NavLink>
      </section>

      <main className="conteudo-principal">
        <div className="conteudo-esquerda">
          <NavLink to="/agenda" className="navlink">
            <CardGrande titulo="Atividades do dia" atividades={atividadesDoDia} />
          </NavLink>
        </div>
        <div className="conteudo-direita">
          <div className="cartao">
            <h2>Ações Rápidas</h2>
            <div className="acoes-rapidas">
              <NavLink to="/avisos" className="navlink">
                <BotaoLaranja mensagem="Criar aviso" icone={faPlus} />
              </NavLink>
              <NavLink to="/alunos" className="navlink">
                <BotaoLaranja mensagem="Gerenciar Alunos" icone={faUsers} />
              </NavLink>
              <NavLink to="/mensagens" className="navlink">
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