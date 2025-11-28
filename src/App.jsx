import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import PaginaAlunos from './pages/PaginaAlunos/PaginaAlunos';
import PaginaChamada from './pages/PaginaChamada/PaginaChamada';
import PaginaAlunosInfo from './pages/PaginaAlunosInfo/PaginaAlunosInfo';
import { RotaProtegida } from './contexts/PrivateRoutes';
import PaginaRegister from './pages/Register/PaginaRegister';
import PaginaAgenda from './pages/PaginaAgenda/PaginaAgenda';

const Avisos = () => <h1>Página de Avisos</h1>;
const Mensagens = () => <h1>Página de Mensagens</h1>;
const Configuracoes = () => <h1>Página de Configurações</h1>; 
const Registro = () => <h1>Página de Registro</h1>;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<PaginaRegister />} />
      <Route element={<RotaProtegida />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="alunos" element={<PaginaAlunos />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="agenda" element={<PaginaAgenda />} />
          <Route path="mensagens" element={<Mensagens />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="registro" element={<Registro />}/>
          <Route path="chamada" element={<PaginaChamada />}/>
          <Route path="*" element={<h1>Página não encontrada</h1>} />
          <Route path="alunos/:id" element={<PaginaAlunosInfo />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;