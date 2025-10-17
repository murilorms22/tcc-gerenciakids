import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout/AppLayout';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import PaginaAlunos from './pages/PaginaAlunos/PaginaAlunos';

const Avisos = () => <h1>Página de Avisos</h1>;
const Agenda = () => <h1>Página da Agenda</h1>;
const Mensagens = () => <h1>Página de Mensagens</h1>;
const Configuracoes = () => <h1>Página de Configurações</h1>; 
const Registro = () => <h1>Página de Registro</h1>;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="alunos" element={<PaginaAlunos />} />
        <Route path="avisos" element={<Avisos />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="mensagens" element={<Mensagens />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="registro" element={<Registro />}/>
      </Route>
    </Routes>
  );
}

export default App;