import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function AppLayout() {
  return (
    <div className="flex min-h-screen w-full"> 
      <Sidebar />
      <main className="w-full p-4" style={{backgroundColor: 'var(--bg-page)'}}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;