'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import './Profile.css';

export function Profile() {
  // Update the destructured values to include username
  const { isAuthenticated, userType, username, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return <div className="loading">Redirecting to login...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Welcome to your Profile!</h1>
        
        <div className="profile-info">
          <div className="profile-avatar">
            👤
          </div>
          
          <div className="profile-details">
            {/* Display the username instead of just account type */}
            <p><strong>Username:</strong> {username || 'User'}</p>
            
            {userType === 'admin' && (
              <button 
                className="admin-button" 
                onClick={() => router.push('/admin-overview')}
              >
                Go to Admin Dashboard
              </button>
            )}
          </div>
        </div>
        
        <div className="profile-actions">
          <button 
            onClick={() => router.push('/shop')} 
            className="shop-button"
          >
            Continue Shopping
          </button>
          
          <button 
            onClick={handleLogout} 
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;