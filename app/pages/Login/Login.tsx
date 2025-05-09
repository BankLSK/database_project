'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import { useState } from 'react';

export function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === 'admin@gmail.com' && password === 'admin123') {
        login('admin');
        router.push('/admin-overview');
      } else {
        login('user');
        router.push('/profile');
      }
    };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        Don't have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
