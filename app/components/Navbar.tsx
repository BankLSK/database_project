'use client';

import Link  from 'next/link';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export function Navbar() {
  const { isLoggedIn } = useAuth();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">MangaStore</Link>
      <div className="navbar-links">
        <Link href="/">Home</Link>
        <Link href="/collection">Collection</Link>
        <Link href="/best-seller">Best Seller</Link>
        <Link href="/shop">Shop</Link>
      </div>
      <div>
        {isLoggedIn ? (
          <Link href="/profile">Profile</Link>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
