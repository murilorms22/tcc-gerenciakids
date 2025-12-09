import React, { createContext, useState, useContext, useEffect } from 'react';
import dataService from '../services/dataService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("USER")) || null);
  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN") || null);

  const login = async (username, password) => {
    try {
      const response = await dataService.autenticar(username, password);

      const { accessToken, ...userData } = response.data;

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("ACCESS_TOKEN", accessToken);
      localStorage.setItem("USER", JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("Erro ao logar:", error);
      return false;
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
    <AuthContext.Provider value={{ isAutenticado, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);