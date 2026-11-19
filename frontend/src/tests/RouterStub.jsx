import React from 'react'
import { createRoutesFromElements, createBrowserRouter, Route, RouterProvider } from 'react-router-dom'

// cria um roteador fictício para evitar erros de contexto ao testar componentes com links
const RouterStub = ({ component }) => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="*" element={component} />
    )
  )
  return <RouterProvider router={router} />
}

export default RouterStub