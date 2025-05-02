import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isLoggedIn } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">MangaStore</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/best-seller">Best Seller</Link>
        <Link to="/shop">Shop</Link>
      </div>
      <div>
        {isLoggedIn ? (
          <Link to="/profile">Profile</Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
