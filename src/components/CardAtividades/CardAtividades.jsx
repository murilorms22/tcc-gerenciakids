import React from 'react'
import '../Dashboard/Dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function CardAtividades({ titulo, horario, numeroSala, icone }) {
  return (
    <li className="item-atividade">
      <FontAwesomeIcon icon={icone} />
      <div>
        <p className="titulo-atividade">{titulo}</p>
        <small className="acao-pequena">{horario} - Sala {numeroSala}</small>
      </div>
    </li>
  )
}

export default CardAtividades