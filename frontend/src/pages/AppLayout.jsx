import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-(--bg-page)">
      {/* Topbar Mobile */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-(--orange) text-white shadow-md">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg bg-white/15 text-white border-none cursor-pointer"
          aria-label="Abrir menu"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <span className="font-bold text-lg">GerenciaKids</span>
        <span className="text-xs font-bold uppercase bg-white text-(--orange) px-2.5 py-1 rounded-full">
          {user?.role || 'USUÁRIO'}
        </span>
      </header>

      <Sidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main
        className="flex-1 w-full p-4 md:p-6 overflow-x-hidden"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
