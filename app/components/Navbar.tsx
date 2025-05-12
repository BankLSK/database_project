'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export function Navbar() {
  const { isAuthenticated, username, userType, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">MangaStore</Link>
      
      <div className="navbar-links">
        <Link href="/">Home</Link>
        <Link href="/collection">Collection</Link>
        <Link href="/best-seller">Best Seller</Link>
        <Link href="/shop">Shop</Link>
      </div>
      
      <div className="auth-section">
        {isAuthenticated ? (
          <div className="profile-dropdown">
              <Link href="/profile" className="profile-button">Profile
              </Link>
          
            {showDropdown && (
              <div className="dropdown-menu">
                <Link 
                  href="/profile" 
                  onClick={() => setShowDropdown(false)}
                  className="dropdown-item"
                >
                  My Profile
                </Link>
                
                {userType === 'admin' && (
                  <Link 
                    href="/admin-overview" 
                    onClick={() => setShowDropdown(false)}
                    className="dropdown-item"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item logout-item"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="login-button">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;