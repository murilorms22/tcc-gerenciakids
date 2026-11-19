import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PaginaRegister from './pages/PaginaRegister';
import PaginaAlunos from './pages/PaginaAlunos';
import PaginaAlunosInfo from './pages/PaginaAlunosInfo';
import PaginaChamada from './pages/PaginaChamada';
import PaginaAgenda from './pages/PaginaAgenda';
import PaginaAvisos from './pages/PaginaAvisos';
import Pagina403 from './pages/Pagina403';
import AdminAlunos from './pages/Admin/AdminAlunos';
import AdminTurmas from './pages/Admin/AdminTurmas';
import PaginaAuditoria from './pages/Admin/PaginaAuditoria';
import { RotaProtegida } from './contexts/PrivateRoutes';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<PaginaRegister />} />

      {/* Rotas autenticadas para qualquer perfil logado */}
      <Route element={<RotaProtegida />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="alunos" element={<PaginaAlunos />} />
          <Route path="alunos/:id" element={<PaginaAlunosInfo />} />
          <Route path="avisos" element={<PaginaAvisos />} />
          <Route path="agenda" element={<PaginaAgenda />} />
          <Route path="403" element={<Pagina403 />} />

          {/* Rotas restritas a PROFESSOR, DIRECAO e ADMIN */}
          <Route
            element={
              <RotaProtegida
                allowedRoles={['PROFESSOR', 'DIRECAO', 'ADMIN']}
              />
            }
          >
            <Route path="chamada" element={<PaginaChamada />} />
          </Route>

          {/* Rotas administrativas e LGPD restritas a DIRECAO e ADMIN */}
          <Route
            element={<RotaProtegida allowedRoles={['DIRECAO', 'ADMIN']} />}
          >
            <Route path="admin/alunos" element={<AdminAlunos />} />
            <Route path="admin/turmas" element={<AdminTurmas />} />
            <Route path="admin/auditoria" element={<PaginaAuditoria />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h1 className="text-3xl font-bold text-(--azul-escuro)">
                  Página não encontrada
                </h1>
              </div>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
