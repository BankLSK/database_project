'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import './Signup.css';
import { address } from 'framer-motion/client';

function Signup() {
  const [signupType, setSignupType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSignupType = (type: string) => {
    setSignupType(type);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const newUser = {
      signupType,
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      location,
      password,
    };

    // Save into localStorage (multiple users)
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    alert('Signup successful! Now please login.');
    router.push('/login');
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
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Middle Name" 
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
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
            type="phone" 
            placeholder="Phone" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input 
            type="location" 
            placeholder="Address" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}

export default Signup;
