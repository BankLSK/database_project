import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  role: 'admin' | 'user' | null;
  login: (role: 'admin' | 'user') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    const savedRole = localStorage.getItem('userRole') as 'admin' | 'user' | null;

    if (user && savedRole) {
      setIsLoggedIn(true);
      setRole(savedRole);
    }
  }, []);

  const login = (userRole: 'admin' | 'user') => {
    setIsLoggedIn(true);
    setRole(userRole);
    localStorage.setItem('loggedInUser', 'true');
    localStorage.setItem('userRole', userRole);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole(null);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
