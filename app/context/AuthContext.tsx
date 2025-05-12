'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: string;
  username: string;
  customerId: number | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  manualLogin: (email: string, userType: string, username: string, customerId: number) => void;
}


const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: '',
  username: '',
  customerId: null,
  login: async () => false,
  logout: () => {},
  manualLogin: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const type = localStorage.getItem('userType');
    const storedUsername = localStorage.getItem('username');
    const storedCustomerId = localStorage.getItem('customerId');

    if (token) {
      setIsAuthenticated(true);
      setUserType(type || '');
      setUsername(storedUsername || '');
      if (storedCustomerId) {
        setCustomerId(parseInt(storedCustomerId, 10));
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.type);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('customerId', data.user.customerid.toString());

        setIsAuthenticated(true);
        setUserType(data.user.type);
        setUsername(data.user.username);
        setCustomerId(data.user.customerid);

        return true;
      } else {
        console.log('Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const manualLogin = (
    email: string,
    userType: string,
    username: string,
    customerId: number
  ) => {
    localStorage.setItem('token', 'admin-token'); // fake token
    localStorage.setItem('userType', userType);
    localStorage.setItem('username', username);
    localStorage.setItem('customerId', customerId.toString());

    setIsAuthenticated(true);
    setUserType(userType);
    setUsername(username);
    setCustomerId(customerId);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('customerId');

    setIsAuthenticated(false);
    setUserType('');
    setUsername('');
    setCustomerId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        username,
        customerId,
        login,
        logout,
        manualLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
