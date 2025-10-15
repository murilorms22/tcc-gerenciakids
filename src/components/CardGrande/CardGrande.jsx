import React from 'react';
import '../Dashboard/Dashboard.css'; // Pode criar um CSS próprio depois
import CardAtividades from '../CardAtividades/CardAtividades';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';

function CardGrande({ titulo, atividades = [] }) {
  return (
    <div className="cartao">
      <h2>{titulo}</h2>
      <ul className="lista-atividades">
        {atividades.length > 0 ? (
          atividades.map((atividade) => (
            <CardAtividades
              key={atividade.id}
              titulo={atividade.titulo}
              horario={atividade.horario}
              numeroSala={atividade.numeroSala}
              icone={faCalendarDay}
            />
          ))
        ) : (
          <p>Nenhuma atividade agendada.</p>
        )}
      </ul>
    </div>
  );
}

export default CardGrande;