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

interface BookStock {
  id: number;
  title: string;
  quantity: number;
  price: string;
}

export function AdminOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [stock, setStock] = useState<BookStock[]>([]);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<User>({ username: '', email: '', loginTime: '' });
  const [editingBookIndex, setEditingBookIndex] = useState<number | null>(null);
  const [editedBook, setEditedBook] = useState<BookStock>({ id: 0, title: '', quantity: 0, price: '' });
  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [newBook, setNewBook] = useState<BookStock>({ id: 0, title: '', quantity: 0, price: '' });

  const cards = [
    { title: 'Total Sales', value: '$12,345', color: '#667eea' },
    { title: 'Total Orders', value: '432', color: '#ff758c' },
    { title: 'Total Users', value: users.length.toString(), color: '#43cea2' },
    { title: 'In Stock', value: stock.reduce((acc, b) => acc + b.quantity, 0).toString(), color: '#f9ca24' },
  ];

  const orders = [
    { id: 1, username: 'JohnDoe', book: 'One Piece Vol.1', price: '$12.99' },
    { id: 2, username: 'JaneSmith', book: 'Naruto Vol.5', price: '$10.99' },
    { id: 3, username: 'CoolGuy', book: 'Attack on Titan Vol.2', price: '$15.99' },
  ];

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);

    const defaultStock: BookStock[] = [
      { id: 1, title: 'One Piece Vol.1', quantity: 24, price: '$12.99' },
      { id: 2, title: 'Naruto Vol.5', quantity: 15, price: '$10.99' },
      { id: 3, title: 'Attack on Titan Vol.2', quantity: 30, price: '$15.99' },
    ];
    const storedStock = JSON.parse(localStorage.getItem('stock') || 'null') || defaultStock;
    setStock(storedStock);
  }, []);

  // User handlers
  const handleDeleteUser = (index: number) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
  };

  const handleEditUser = (index: number) => {
    setEditingUserIndex(index);
    setEditedUser(users[index]);
  };

  const handleSaveUser = (index: number) => {
    const updated = [...users];
    updated[index] = editedUser;
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
    setEditingUserIndex(null);
  };

  const handleChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  // Book handlers
  const handleDeleteBook = (index: number) => {
    const updated = [...stock];
    updated.splice(index, 1);
    setStock(updated);
    localStorage.setItem('stock', JSON.stringify(updated));
  };

  const handleEditBook = (index: number) => {
    setEditingBookIndex(index);
    setEditedBook(stock[index]);
  };

  const handleSaveBook = (index: number) => {
    const updated = [...stock];
    updated[index] = editedBook;
    setStock(updated);
    localStorage.setItem('stock', JSON.stringify(updated));
    setEditingBookIndex(null);
  };

  const handleChangeBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBook(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleAddStock = () => {
    setAddingBook(true);
    setNewBook({ id: stock.length + 1, title: '', quantity: 0, price: '' });
  };

  const handleChangeNewBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSaveNewBook = () => {
    const updated = [...stock, newBook];
    setStock(updated);
    localStorage.setItem('stock', JSON.stringify(updated));
    setAddingBook(false);
  };

  return (
    <div className="admin-container">
      <motion.div className="frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        {cards.map((card, index) => (
          <motion.div key={index} className="box" style={{ backgroundColor: card.color }} whileHover={{ scale: 1.05 }}>
            <div className="box-content">
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Orders */}
      <motion.div className="admin-table-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
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
      <motion.div className="admin-table-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <h2>Book Stock</h2>
        <input className="admin-filter-input" placeholder="Filter by title..." value={bookFilter} onChange={e => setBookFilter(e.target.value)} />
        
        <div className="admin-actions add-but">
          <button onClick={handleAddStock}>Add Stock</button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.filter(book => book.title.toLowerCase().includes(bookFilter.toLowerCase())).map((book, index) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{editingBookIndex === index ? <input name="title" value={editedBook.title} onChange={handleChangeBook} /> : book.title}</td>
                <td>{editingBookIndex === index ? <input name="quantity" type="number" value={editedBook.quantity} onChange={handleChangeBook} /> : book.quantity}</td>
                <td>{editingBookIndex === index ? <input name="price" value={editedBook.price} onChange={handleChangeBook} /> : book.price}</td>
                <td className="admin-actions">
                  {editingBookIndex === index ? (
                    <>
                      <button onClick={() => handleSaveBook(index)}>Save</button>
                      <button onClick={() => setEditingBookIndex(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditBook(index)}>Edit</button>
                      <button onClick={() => handleDeleteBook(index)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {addingBook && (
              <tr>
                <td>{newBook.id}</td>
                <td><input name="title" value={newBook.title} onChange={handleChangeNewBook} /></td>
                <td><input name="quantity" type="number" value={newBook.quantity} onChange={handleChangeNewBook} /></td>
                <td><input name="price" value={newBook.price} onChange={handleChangeNewBook} /></td>
                <td className="admin-actions">
                  <button onClick={handleSaveNewBook}>Add</button>
                  <button onClick={() => setAddingBook(false)}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Users */}
      <motion.div className="admin-table-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <h2>Manage Users</h2>
        <input className="admin-filter-input" placeholder="Filter by username..." value={userFilter} onChange={e => setUserFilter(e.target.value)} />
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
            {users.filter(user => user.username.toLowerCase().includes(userFilter.toLowerCase())).map((user, index) => (
              <tr key={index}>
                <td>{editingUserIndex === index ? <input name="username" value={editedUser.username} onChange={handleChangeUser} /> : user.username}</td>
                <td>{editingUserIndex === index ? <input name="email" value={editedUser.email} onChange={handleChangeUser} /> : user.email}</td>
                <td>{user.loginTime}</td>
                <td className="admin-actions">
                  {editingUserIndex === index ? (
                    <>
                      <button onClick={() => handleSaveUser(index)}>Save</button>
                      <button onClick={() => setEditingUserIndex(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditUser(index)}>Edit</button>
                      <button onClick={() => handleDeleteUser(index)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="logout-container">
        <LogoutButton />
      </div>
    </div>
  );
}

export default AdminOverview;
