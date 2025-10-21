import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAutenticado, setIsAutenticado] = useState(false);

  const login = () => setIsAutenticado(true);

  return (
    <AuthContext.Provider value={{ isAutenticado, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);