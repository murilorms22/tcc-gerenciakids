import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUserGroup, faBell, faEnvelope, faCalendar, faGear } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/logo.png';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="" />
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" className="sidebar-item">
              <FontAwesomeIcon icon={faHouse} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/alunos" className="sidebar-item">
              <FontAwesomeIcon icon={faUserGroup} />
              <span>Alunos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/avisos" className="sidebar-item">
              <FontAwesomeIcon icon={faBell} />
              <span>Avisos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/agenda" className="sidebar-item">
              <FontAwesomeIcon icon={faCalendar} />
              <span>Agenda</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/mensagens" className="sidebar-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Mensagens</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/configuracoes" className="sidebar-item">
              <FontAwesomeIcon icon={faGear} />
              <span>Configurações</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;