import React from 'react';
import { Outlet } from 'react-router-dom';
import './AppLayout.css';
import Sidebar from '../components/Sidebar/Sidebar';

function AppLayout() {
  return (
    <div className="app-container"> 
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;