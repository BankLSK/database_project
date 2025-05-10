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

  return (
    <div className="admin-container">

      {/* Remove: Frame with 4 boxes */}
      {/* <motion.div className="frame" ... > ... </motion.div> */}

      {/* Latest Orders */}
      <motion.div 
        className="admin-table-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2>Latest Orders</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Book</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.username}</td>
                <td>{order.book}</td>
                <td>{order.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Book Stock */}
      <motion.div 
        className="admin-table-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2>Book Stock</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(book => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.quantity}</td>
                <td>{book.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Manage Users */}
      <motion.div 
        className="admin-table-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2>Manage Users</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Login Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>
                  {editingIndex === index ? (
                    <input name="username" value={editedUser.username} onChange={handleChange} />
                  ) : user.username}
                </td>
                <td>
                  {editingIndex === index ? (
                    <input name="email" value={editedUser.email} onChange={handleChange} />
                  ) : user.email}
                </td>
                <td>{user.loginTime}</td>
                <td className="admin-actions">
                  {editingIndex === index ? (
                    <>
                      <button onClick={() => handleSave(index)}>Save</button>
                      <button onClick={() => setEditingIndex(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(index)}>Edit</button>
                      <button onClick={() => handleDelete(index)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Dashboard Cards (moved to bottom) */}
      <motion.div 
        className="admin-cards"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {cards.map((card, index) => (
          <motion.div 
            className="admin-card"
            key={index}
            style={{ background: card.color }}
            whileHover={{ scale: 1.05 }}
          >
            <h2>{card.title}</h2>
            <p>{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Logout */}
      <div className="logout-container">
        <LogoutButton />
      </div>

    </div>
  );
}

export default AdminOverview;
