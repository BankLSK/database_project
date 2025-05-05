// The 'use client'; directive at the top is necessary because this is a client component (it uses browser APIs like localStorage and navigation).
'use client'; 

import { useRouter } from 'next/navigation';

function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/');
  };

  return (
    <button 
      onClick={handleLogout} 
      style={{
        backgroundColor: '#ff4d4d',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '1rem'
      }}
    >
      Log Out
    </button>
  );
}

export default LogoutButton;
