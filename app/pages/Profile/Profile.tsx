'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export function Profile() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="profile-container">
      <h1>Welcome to your Profile!</h1>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
}

export default Profile;
