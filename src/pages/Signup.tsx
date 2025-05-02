import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Signup.css';

function Signup() {
  const [signupType, setSignupType] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignupType = (type: string) => {
    setSignupType(type);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const newUser = {
      signupType,
      username,
      email,
      password,
    };

    // Save into localStorage (multiple users)
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    alert('Signup successful! Now please login.');
    navigate('/login');
  };

  return (
    <motion.div 
      className="signup-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1>Sign Up</h1>

      {!signupType && (
        <div className="signup-choice">
          <button className="google-btn" onClick={() => handleSignupType('Google')}>Sign up with Google</button>
          <button className="facebook-btn" onClick={() => handleSignupType('Facebook')}>Sign up with Facebook</button>
        </div>
      )}

      {signupType && (
        <form onSubmit={handleSignup} className="signup-form">
          <p>Signing up with: <strong>{signupType}</strong></p>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Create Account</button>
          <p style={{ marginTop: '1rem' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}

export default Signup;
