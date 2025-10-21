import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../Dashboard/Dashboard.css'

function BotaoLaranja({ mensagem, icone, onClick }) {
  return (
    <button className="botao-acao" onClick={onClick}>
      <FontAwesomeIcon icon={icone} />
      <span>{mensagem}</span>
    </button>
  );
}

export default BotaoLaranja;