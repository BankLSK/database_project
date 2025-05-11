'use client';

import { useState } from 'react';

export default function Collection() {
  const [message, setMessage] = useState('');

  const handleAdminCollection = async () => {
    try {
      const res = await fetch('http://localhost:8080/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@gmail.com',
          password: 'admin123'
        })
      });
      const text = await res.text();
      setMessage(text);
    } catch (error) {
      console.error('Error fetching admin collection:', error);
      setMessage('Failed to contact server.');
    }
  };

  return (
    <div>
      <h1>Collection Page</h1>
      <button onClick={handleAdminCollection}>Load Admin Collection</button>
      {message && <p>{message}</p>}
    </div>
  );
}
