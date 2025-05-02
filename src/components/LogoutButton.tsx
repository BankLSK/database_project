import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
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
