import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faArrowLeft,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Pagina403() {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-8">
      <div className="bg-white p-10 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-xl w-full text-center border-t-[6px] border-t-(--orange)">
        <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6 text-4xl">
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>

        <span className="inline-flex items-center gap-2 bg-orange-100 text-(--dark-orange) text-xs font-bold px-3 py-1 rounded-full mb-3">
          <FontAwesomeIcon icon={faLock} /> ERRO HTTP 403 — PROTEÇÃO RBAC & LGPD
        </span>

        <h1 className="text-3xl font-bold text-(--azul-escuro) mb-3">
          Acesso Negado
        </h1>

        <p className="text-(--text-gray) text-base mb-6 leading-relaxed">
          O seu perfil atual{' '}
          <strong className="text-(--azul-escuro)">
            ({user?.role || 'DESCONHECIDO'})
          </strong>{' '}
          não possui permissão para acessar este módulo. Em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD — Art. 14)</strong>, o
          acesso a operações administrativas e trilhas de auditoria é restrito.
        </p>

        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-6 py-3 bg-(--orange) text-white rounded-lg font-bold no-underline hover:bg-(--light-orange) transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Voltar ao Painel Principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

