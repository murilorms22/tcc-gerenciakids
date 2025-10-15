import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../Dashboard/Dashboard.css'

function BotaoLaranja({ mensagem, icone }) {
  return (
    <button className="botao-acao">
      <FontAwesomeIcon icon={icone} />
      <span>{mensagem}</span>
    </button>
  );
}

export default BotaoLaranja;