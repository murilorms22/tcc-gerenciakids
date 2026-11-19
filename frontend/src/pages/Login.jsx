import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BotaoLaranja from '../components/BotaoLaranja';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import imgLogin from '../assets/login-illustration.svg';
import logo from '../assets/logo.png';

export function PaginaLogin() {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput || !senhaInput) {
      setErro('Preencha todos os campos.');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      await login(emailInput, senhaInput);
      navigate('/');
    } catch (error) {
      setErro(error.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const preencherDemo = (email) => {
    setEmailInput(email);
    setSenhaInput('Senha123');
    setErro('');
  };

  return (
    <div className="flex flex-col m-auto min-h-screen items-center justify-center p-4 w-full">
      <img src={logo} alt="GerenciaKids" className="w-60 mb-6" />

      <div className="flex flex-col md:flex-row border-2 border-(--orange) rounded-[10px] shadow-[10px_10px_30px_rgba(0,0,0,0.2)] bg-white overflow-hidden max-w-4xl w-full">
        <form
          onSubmit={handleLogin}
          className="p-8 md:p-[50px] text-(--azul-escuro) bg-white flex-1 flex flex-col justify-center"
        >
          <h1 className="text-2xl font-bold mb-1">Entre com sua conta</h1>
          <p className="text-sm text-(--text-gray) mb-4">
            Acesso autenticado com controle de perfil e proteção LGPD.
          </p>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 font-semibold text-center">
              {erro}
            </div>
          )}

          <div className="flex flex-col gap-[15px]">
            <div className="flex flex-col gap-[5px]">
              <label htmlFor="email" className="text-lg text-(--azul-escuro)">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="p-2.5 text-base border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Ex: direcao@escola.com"
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label htmlFor="senha" className="text-lg text-(--azul-escuro)">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                className="p-2.5 text-base border border-(--azul-escuro) rounded-[5px] focus:outline-none focus:border-(--orange)"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            {/* Atalhos rápidos de perfis para homologação e testes de sistema */}
            <div className="bg-(--bg-gray-light) p-3 rounded-lg border border-(--border-gray)">
              <p className="text-xs text-(--text-gray) font-semibold mb-2">
                Contas de Teste (Senha: Senha123):
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => preencherDemo('direcao@escola.com')}
                  className="text-xs px-2.5 py-1 rounded bg-white border border-(--border-gray) text-(--azul-escuro) hover:border-(--orange) cursor-pointer font-semibold"
                >
                  Direção
                </button>
                <button
                  type="button"
                  onClick={() => preencherDemo('professor@escola.com')}
                  className="text-xs px-2.5 py-1 rounded bg-white border border-(--border-gray) text-(--azul-escuro) hover:border-(--orange) cursor-pointer font-semibold"
                >
                  Professor
                </button>
                <button
                  type="button"
                  onClick={() => preencherDemo('responsavel@escola.com')}
                  className="text-xs px-2.5 py-1 rounded bg-white border border-(--border-gray) text-(--azul-escuro) hover:border-(--orange) cursor-pointer font-semibold"
                >
                  Responsável
                </button>
                <button
                  type="button"
                  onClick={() => preencherDemo('admin@escola.com')}
                  className="text-xs px-2.5 py-1 rounded bg-white border border-(--border-gray) text-(--azul-escuro) hover:border-(--orange) cursor-pointer font-semibold"
                >
                  Admin
                </button>
              </div>
            </div>

            <BotaoLaranja
              type="submit"
              mensagem={loading || authLoading ? 'Entrando...' : 'Entrar'}
              icone={faSignInAlt}
              disabled={loading || authLoading}
            />

            <p className="mt-3 text-center text-sm">
              É responsável e não tem conta?{' '}
              <span
                className="text-(--orange) font-bold cursor-pointer hover:underline"
                onClick={() => navigate('/register')}
              >
                Registre-se!
              </span>
            </p>
          </div>
        </form>

        <div className="hidden md:flex p-[30px] text-(--azul-escuro) bg-white items-center justify-center flex-1 border-l border-(--border-light)">
          <img
            src={imgLogin}
            alt="Ilustração de Login"
            className="max-h-[380px] w-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default PaginaLogin;
