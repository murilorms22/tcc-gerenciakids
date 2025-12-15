import React from 'react';
import CardAtividades from './CardAtividades';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';

function CardGrande({ titulo, atividades = [] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
      <h2 className="mb-4 text-(--azul-escuro)">{titulo}</h2>
      <ul className="list-none p-0 m-0">
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