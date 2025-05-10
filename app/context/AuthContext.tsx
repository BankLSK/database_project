'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode} from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  login: (userType: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);

  // Check for existing auth on component mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUserType(storedUserType);
    }
  }, []);

  const login = (userType: string) => {
    setIsAuthenticated(true);
    setUserType(userType);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', userType);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
