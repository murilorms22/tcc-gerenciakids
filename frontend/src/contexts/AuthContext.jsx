import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('USER');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem('ACCESS_TOKEN') || null,
  );
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(() =>
    Boolean(localStorage.getItem('ACCESS_TOKEN')),
  );

  // Valida sessão ativa com GET /auth/me ao carregar a aplicação
  useEffect(() => {
    let active = true;
    const validarSessao = async () => {
      const storedToken = localStorage.getItem('ACCESS_TOKEN');
      if (!storedToken) {
        if (active) setInitializing(false);
        return;
      }
      try {
        const meData = await authService.me();
        if (active && meData) {
          setUser(meData);
          localStorage.setItem('USER', JSON.stringify(meData));
        }
      } catch {
        if (active) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('ACCESS_TOKEN');
          localStorage.removeItem('USER');
        }
      } finally {
        if (active) setInitializing(false);
      }
    };

    validarSessao();
    return () => {
      active = false;
    };
  }, []);

  /**
   * Realiza login via API NestJS (POST /auth/login)
   */
  const login = async (email, senha) => {
    setLoading(true);
    try {
      const data = await authService.login(email, senha);
      const accessToken = data.access_token || data.accessToken;
      const userData = data.user;

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('ACCESS_TOKEN', accessToken);
      localStorage.setItem('USER', JSON.stringify(userData));

      return userData;
    } catch (error) {
      const apiMsg = error.response?.data?.message;
      if (apiMsg) {
        throw new Error(Array.isArray(apiMsg) ? apiMsg.join(' ') : apiMsg);
      }
      if (error.response?.status === 401 || error.response?.status === 400) {
        throw new Error('E-mail ou senha incorretos.');
      }
      if (!error.response) {
        throw new Error(
          'Servidor indisponível. Verifique se a API NestJS está rodando na porta 3001.',
        );
      }
      throw new Error('Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra novo usuário responsável via API NestJS (POST /auth/register)
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      return { success: true, data };
    } catch (error) {
      const apiMsg = error.response?.data?.message;
      if (apiMsg) {
        throw new Error(Array.isArray(apiMsg) ? apiMsg.join(' ') : apiMsg);
      }
      if (error.response?.status === 409) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      throw new Error('Erro ao registrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('ACCESS_TOKEN')) {
        await authService.logout();
      }
    } catch {
      // Ignora erro caso o token já tenha expirado no servidor
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('USER');
    }
  };

  const isAutenticado = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        isAutenticado,
        user,
        token,
        loading,
        initializing,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
