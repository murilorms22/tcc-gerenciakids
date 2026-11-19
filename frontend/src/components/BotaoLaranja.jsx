import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function BotaoLaranja({
  mensagem,
  icone,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-3 p-4 bg-(--orange) text-white border-none rounded-lg text-base font-medium cursor-pointer transition-colors duration-200 w-full hover:bg-(--light-orange) disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {icone && <FontAwesomeIcon icon={icone} />}
      <span>{mensagem}</span>
    </button>
  );
}

export default BotaoLaranja;
