import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function CardAtividades({ titulo, horario, numeroSala, icone }) {
  return (
    <li className="flex items-center gap-3 mb-4 text-base text-(--not-black)">
      <FontAwesomeIcon icon={icone} />
      <div>
        <p className="font-semibold m-0">{titulo}</p>
        <small className="text-(--text-gray)">{horario} - Sala {numeroSala}</small>
      </div>
    </li>
  )
}

export default CardAtividades