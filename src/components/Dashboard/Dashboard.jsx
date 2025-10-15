import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import dadosMockados from '../../dadosMockados';
import BotaoLaranja from '../BotaoLaranja/BotaoLaranja';
import CardGrande from '../CardGrande/CardGrande';

const atividadesDoDia = [
    { id: 1, titulo: "Reunião com pais", horario: "15h", numeroSala: 3 },
    { id: 2, titulo: "Dia do brinquedo", horario: "16h", numeroSala: 2 },
    { id: 3, titulo: "Hora do conto", horario: "10h", numeroSala: 1 }
];

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDados = () => {
      setTimeout(() => {
        setDados(dadosMockados);
        setCarregando(false);
      }, 1000);
    };
    buscarDados();
  }, []);

  if (carregando) {
    return <div className="painel-container"><h1>Carregando informações...</h1></div>;
  }

  return (
    <div className="painel-container">
      <header className="painel-cabecalho">
        <div>
          <h1>Bem-vindo, Professor {dados.professor.nome}!</h1>
          <p>Painel de controle da turma {dados.turma.nome_turma}.</p>
        </div>
        <div>
          <button className="fazer-chamada">
            <FontAwesomeIcon icon={faPlus} />
            <span>Realizar chamada</span>
          </button>
        </div>
      </header>

      <section className="painel-resumo">
      </section>

      <main className="conteudo-principal">
        <div className="conteudo-esquerda">
          <CardGrande titulo="Atividades do dia" atividades={atividadesDoDia} />
        </div>
        <div className="conteudo-direita">
          <div className="cartao">
            <h2>Ações Rápidas</h2>
            <div className="acoes-rapidas">
              <BotaoLaranja mensagem="Criar aviso" icone={faPlus} />
              <BotaoLaranja mensagem="Gerenciar Alunos" icone={faUsers} />
              <BotaoLaranja mensagem="Ler Mensagens" icone={faEnvelopeOpenText} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;