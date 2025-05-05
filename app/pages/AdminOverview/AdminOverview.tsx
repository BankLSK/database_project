'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LogoutButton from '../../components/LogoutButton';
import './AdminOverview.css';

interface User {
  username: string;
  email: string;
  loginTime: string;
}

export function AdminOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<User>({ username: '', email: '', loginTime: '' });

  const cards = [
    { title: 'Total Sales', value: '$12,345', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Total Orders', value: '432', color: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)' },
    { title: 'Total Users', value: users.length.toString(), color: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' },
  ];

  const orders = [
    { id: 1, username: 'JohnDoe', book: 'One Piece Vol.1', price: '$12.99' },
    { id: 2, username: 'JaneSmith', book: 'Naruto Vol.5', price: '$10.99' },
    { id: 3, username: 'CoolGuy', book: 'Attack on Titan Vol.2', price: '$15.99' },
  ];

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  }, []);

  const handleDelete = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedUser(users[index]);
  };

  const handleSave = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers[index] = editedUser;
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setEditingIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-container">

      {/* Dashboard Cards */}
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

      {/* Animation Frame (4 Boxes) */}
      <motion.div 
        className="frame"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="box box1 type-1"></div>
        <div className="box box2 type-2"></div>
        <div className="box box3 type-1"></div>
        <div className="box box4 type-2"></div>
      </motion.div>

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
                    <input 
                      name="username"
                      value={editedUser.username}
                      onChange={handleChange}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editingIndex === index ? (
                    <input 
                      name="email"
                      value={editedUser.email}
                      onChange={handleChange}
                    />
                  ) : (
                    user.email
                  )}
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

      {/* Logout */}
      <div className="logout-container">
        <LogoutButton />
      </div>

    </div>
  );
}

export default AdminOverview;
