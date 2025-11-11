import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function BotaoLaranja({ mensagem, icone, onClick }) {
  return (
    <button className="flex items-center justify-center gap-3 p-4 bg-(--orange) text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 w-full hover:bg-(--light-orange)" onClick={onClick}>
      <FontAwesomeIcon icon={icone} />
      <span>{mensagem}</span>
    </button>
  );
}

export default BotaoLaranja;