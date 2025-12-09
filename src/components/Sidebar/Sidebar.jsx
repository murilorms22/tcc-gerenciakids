import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUserGroup, faBell, faEnvelope, faCalendar, faGear, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-[400px] bg-(--orange) text-white flex flex-col">
      <div className="h-24 my-4 flex items-center justify-center text-2xl font-bold">
        <img 
          src={logo} 
          alt="" 
          className="w-[300px] rounded-lg py-5 px-7"
          style={{
            filter: 'drop-shadow(1.5px 0 0 white) drop-shadow(-1.5px 0 0 white) drop-shadow(0 1.5px 0 white) drop-shadow(0 -1.5px 0 white)'
          }}
        />
      </div>
      <nav className="grow p-4">
        <ul className="list-none">
          <li>
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faHouse} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/alunos" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faUserGroup} />
              <span>Alunos</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/avisos" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faBell} />
              <span>Avisos</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/agenda" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faCalendar} />
              <span>Agenda</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/mensagens" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Mensagens</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/configuracoes" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faGear} />
              <span>Configurações</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/20">
      <NavLink 
              to="/admin/alunos" 
              className={({isActive}) => 
                `flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${isActive ? 'bg-white/20 font-bold' : ''}`
              }
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Admin</span>
            </NavLink>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 rounded cursor-pointer transition-colors duration-200 text-white bg-transparent border-none hover:bg-white/10 w-full"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;