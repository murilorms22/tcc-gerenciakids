import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';

function AppLayout() {
  return (
    <div className="flex min-h-screen w-full"> 
      <Sidebar />
      <main className="w-full p-4 bg-(--bg-page)">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;