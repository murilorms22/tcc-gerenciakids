import React, { createContext, useState, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("USER")) || null);
  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN") || null);
  const [loading, setLoading] = useState(false);

  /**
   * Realiza login via API (json-server-auth)
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);

      // json-server-auth retorna { accessToken, user }
      const { accessToken, user: userData } = response.data;

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("ACCESS_TOKEN", accessToken);
      localStorage.setItem("USER", JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("Erro ao logar:", error);
      
      // Trata diferentes tipos de erro da API
      if (error.response?.status === 400) {
        throw new Error('Email ou senha incorretos');
      } else if (error.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      } else if (!error.response) {
        throw new Error('Servidor indisponível. Verifique se a API está rodando na porta 3001.');
      }
      
      throw new Error('Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra novo usuário via API
   * @param {object} userData 
   * @returns {Promise}
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Email já cadastrado');
      }
      throw new Error('Erro ao registrar usuário');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER");
  };

  const isAutenticado = !!token;

  return (
    <AuthContext.Provider value={{ isAutenticado, user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);