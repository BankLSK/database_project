import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <h1>Welcome to your Profile!</h1>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Profile;
