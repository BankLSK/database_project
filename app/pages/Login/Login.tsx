'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import { useState } from 'react';

export function Login() {
  const { login, manualLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Special case for the hard-coded admin
      if (email === 'admin@gmail.com' && password === 'admin123') {
        // Direct login for admin (bypassing API)
        // Create a fake success response for admin
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('username', 'admin');
        localStorage.setItem('customerId', '0'); // optional default ID for admin

        manualLogin(email, 'admin', 'admin', 0);
        
        
        router.push('/admin-overview');
        return;
      }

      // For regular users, attempt login via API
      const success = await login(email, password);
      
      if (success) {
        // Get the userType from localStorage (should be set by the login function)
        const userType = localStorage.getItem('userType') || 'user';
        const customerId = localStorage.getItem('customerId');  // Check if customerId exists in localStorage

  
        if (!customerId) {
          // If customerId is missing, fetch it from the API or the response body
          const res = await fetch('http://localhost:8080/get-user-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();

          // Assume the backend response contains the customerId
          if (data.success) {
            localStorage.setItem('customerId', data.customerId);  // Store customerId
          } else {
            setMessage('Could not fetch customer details.');
            return;
          }
        }
        
        // Redirect based on user type
        if (userType === 'admin') {
          router.push('/admin-overview');
        } else {
          router.push('/profile');
        }
      } else {
        // Login failed
        setMessage('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {message && <div className="error-message">{message}</div>}
      
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        Don't have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;