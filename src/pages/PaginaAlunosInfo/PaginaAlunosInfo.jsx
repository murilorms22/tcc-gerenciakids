import React from 'react'
import { useParams } from 'react-router-dom'


function PaginaAlunosInfo() {
  const { id } = useParams();
  return (
    <div>Página de informações do aluno ID: {id}</div>
  )
}

export default PaginaAlunosInfo