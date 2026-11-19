import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faUserGroup,
  faBell,
  faCalendar,
  faClipboardCheck,
  faSignOutAlt,
  faUserShield,
  faChalkboardUser,
  faShieldHalved,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'PROFESSOR';
  const isAdminOrDirecao = role === 'ADMIN' || role === 'DIRECAO';
  const canDoChamada =
    role === 'ADMIN' || role === 'DIRECAO' || role === 'PROFESSOR';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 p-3.5 rounded-lg cursor-pointer transition-colors duration-200 text-white no-underline hover:bg-white/10 ${
      isActive ? 'bg-white/20 font-bold' : ''
    }`;

  const sidebarContent = (
    <div className="w-[320px] xl:w-[360px] h-screen overflow-y-auto bg-(--orange) text-white flex flex-col justify-between shrink-0">
      <div>
        <div className="h-24 mt-4 px-4 flex items-center justify-between">
          <img
            src={logo}
            alt="GerenciaKids"
            className="w-[240px] xl:w-[270px] rounded-lg py-3 px-4 mx-auto"
            style={{
              filter:
                'drop-shadow(1.5px 0 0 white) drop-shadow(-1.5px 0 0 white) drop-shadow(0 1.5px 0 white) drop-shadow(0 -1.5px 0 white)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 border-none bg-transparent cursor-pointer"
            aria-label="Fechar menu"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Identificação do Usuário e Perfil RBAC */}
        {user && (
          <div className="mx-4 mb-2 px-4 py-3 rounded-xl bg-black/15 border border-white/15">
            <p className="text-sm font-bold truncate m-0">
              {user.nome || user.firstName || user.email}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-white/85 truncate">
                {user.email}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white text-(--orange) px-2 py-0.5 rounded-full">
                {role}
              </span>
            </div>
          </div>
        )}

        <nav className="p-4">
          <ul className="list-none p-0 m-0 space-y-1">
            <li>
              <NavLink to="/" end className={navLinkClass} onClick={onClose}>
                <FontAwesomeIcon icon={faHouse} className="w-5" />
                <span>Home</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/alunos" className={navLinkClass} onClick={onClose}>
                <FontAwesomeIcon icon={faUserGroup} className="w-5" />
                <span>
                  {role === 'RESPONSAVEL' ? 'Meus Filhos' : 'Alunos'}
                </span>
              </NavLink>
            </li>

            {canDoChamada && (
              <li>
                <NavLink
                  to="/chamada"
                  className={navLinkClass}
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="w-5" />
                  <span>Chamada / Frequência</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink to="/avisos" className={navLinkClass} onClick={onClose}>
                <FontAwesomeIcon icon={faBell} className="w-5" />
                <span>Mural de Avisos</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/agenda" className={navLinkClass} onClick={onClose}>
                <FontAwesomeIcon icon={faCalendar} className="w-5" />
                <span>Agenda de Atividades</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-white/20 space-y-1">
        {isAdminOrDirecao && (
          <div className="pb-2 mb-2 border-b border-white/20 space-y-1">
            <p className="px-3 text-xs uppercase tracking-wider text-white/75 font-bold mb-1">
              Secretaria & LGPD
            </p>
            <NavLink
              to="/admin/alunos"
              className={navLinkClass}
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faUserShield} className="w-5" />
              <span>Admin Alunos</span>
            </NavLink>
            <NavLink
              to="/admin/turmas"
              className={navLinkClass}
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faChalkboardUser} className="w-5" />
              <span>Turmas e Responsáveis</span>
            </NavLink>
            <NavLink
              to="/admin/auditoria"
              className={navLinkClass}
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faShieldHalved} className="w-5" />
              <span>Auditoria LGPD</span>
            </NavLink>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 p-3.5 rounded-lg cursor-pointer transition-colors duration-200 text-white bg-transparent border-none hover:bg-white/10 w-full text-base"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Drawer Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative z-10 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
