'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LogoutButton from '../../components/LogoutButton';
import './AdminOverview.css';

interface User {
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  location: string;
}

interface BookStock {
  id: number;
  title: string;
  category: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  username: string;
  book: string;
  price: string;
}

export function AdminOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [stock, setStock] = useState<BookStock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<User>({ firstName: '', lastName: '', username: '', email: '', middleName: '', phone: '', location: '' });
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editedBook, setEditedBook] = useState<BookStock>({ id: 0, title: '', category: '', quantity: 0, price: '' });

  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [newBook, setNewBook] = useState<BookStock>({ id: 0, title: '', category: '', quantity: 0, price: '' });

  // Pagination states
  const [orderPage, setOrderPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);

    const defaultStock: BookStock[] = [
      { id: 1, title: 'One Piece Vol.1', category: 'Manga', quantity: 24, price: '$12.99' },
      { id: 2, title: 'Naruto Vol.5', category: 'Manga', quantity: 15, price: '$10.99' },
      { id: 3, title: 'Attack on Titan Vol.2', category: 'Manga', quantity: 30, price: '$15.99' },
    ];
    const storedStock = JSON.parse(localStorage.getItem('stock') || 'null') || defaultStock;
    setStock(storedStock);

    const defaultOrders: Order[] = [
      { id: 1, username: 'JohnDoe', book: 'One Piece Vol.1', price: '$12.99' },
      { id: 2, username: 'JaneSmith', book: 'Naruto Vol.5', price: '$10.99' },
      { id: 3, username: 'CoolGuy', book: 'Attack on Titan Vol.2', price: '$15.99' },
    ];
    const storedOrders = JSON.parse(localStorage.getItem('orders') || 'null') || defaultOrders;
    setOrders(storedOrders);
  }, []);

  const totalSales = orders.reduce((sum, order) => {
    const priceNumber = parseFloat(order.price.replace('$', ''));
    return sum + priceNumber;
  }, 0).toFixed(2);

  const cards = [
    { title: 'Total Sales', value: `$${totalSales}`, color: '#667eea' },
    { title: 'Total Orders', value: orders.length.toString(), color: '#ff758c' },
    { title: 'Total Users', value: users.length.toString(), color: '#43cea2' },
    { title: 'In Stock', value: stock.reduce((acc, b) => acc + b.quantity, 0).toString(), color: '#f9ca24' },
  ];

  // Filtered Data for pagination
  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(userFilter.toLowerCase()));
  const filteredBooks = stock.filter(book => book.title.toLowerCase().includes(bookFilter.toLowerCase()));

  const paginatedOrders = orders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * itemsPerPage, bookPage * itemsPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  // --- Handlers: User ---
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

  // --- Handlers: Book ---
  const handleDeleteBook = (id: number) => {
    const updated = stock.filter(book => book.id !== id);
    setStock(updated);
    localStorage.setItem('stock', JSON.stringify(updated));
  };

  const handleEditBook = (id: number) => {
    const book = stock.find(b => b.id === id);
    if (book) {
      setEditingBookId(id);
      setEditedBook(book);
    }
  };

  const handleSaveBook = () => {
    const updated = stock.map(b => (b.id === editedBook.id ? editedBook : b));
    setStock(updated);
    localStorage.setItem('stock', JSON.stringify(updated));
    setEditingBookId(null);
  };

  const handleChangeBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBook(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleAddStock = () => {
    setAddingBook(true);
    setNewBook({ id: Date.now(), title: '', category: '', quantity: 0, price: '' });
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

  // --- Render ---
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

      {/* Orders Table */}
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
            {paginatedOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.username}</td>
                <td>{order.book}</td>
                <td>{order.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={orders.length} current={orderPage} onPageChange={setOrderPage} />
      </motion.div>

      {/* Book Stock Table */}
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
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{editingBookId === book.id ? <input name="title" value={editedBook.title} onChange={handleChangeBook} /> : book.title}</td>
                <td>{editingBookId === book.id ? <input name="category" value={editedBook.category} onChange={handleChangeBook} /> : book.category}</td>
                <td>{editingBookId === book.id ? <input name="quantity" type="number" value={editedBook.quantity} onChange={handleChangeBook} /> : book.quantity}</td>
                <td>{editingBookId === book.id ? <input name="price" value={editedBook.price} onChange={handleChangeBook} /> : book.price}</td>
                <td className="admin-actions">
                  {editingBookId === book.id ? (
                    <>
                      <button onClick={handleSaveBook}>Save</button>
                      <button onClick={() => setEditingBookId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditBook(book.id)}>Edit</button>
                      <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {addingBook && (
              <tr>
                <td>{newBook.id}</td>
                <td><input name="title" value={newBook.title} onChange={handleChangeNewBook} /></td>
                <td><input name="category" value={newBook.category} onChange={handleChangeNewBook} /></td>
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
        <Pagination total={filteredBooks.length} current={bookPage} onPageChange={setBookPage} />
      </motion.div>

      {/* Users Table */}
      <motion.div className="admin-table-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <h2>Manage Users</h2>
        <input className="admin-filter-input" placeholder="Filter by username..." value={userFilter} onChange={e => setUserFilter(e.target.value)} />
        <table className="admin-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr key={index}>
                <td>{editingUserIndex === index ? <input name="firstName" value={editedUser.firstName} onChange={handleChangeUser} /> : user.firstName}</td>
                <td>{editingUserIndex === index ? <input name="middleName" value={editedUser.middleName} onChange={handleChangeUser} /> : user.middleName}</td>
                <td>{editingUserIndex === index ? <input name="lastName" value={editedUser.lastName} onChange={handleChangeUser} /> : user.lastName}</td>
                <td>{editingUserIndex === index ? <input name="username" value={editedUser.username} onChange={handleChangeUser} /> : user.username}</td>
                <td>{editingUserIndex === index ? <input name="email" value={editedUser.email} onChange={handleChangeUser} /> : user.email}</td>
                <td>{editingUserIndex === index ? <input name="phone" value={editedUser.phone} onChange={handleChangeUser} /> : user.phone}</td>
                <td>{editingUserIndex === index ? <input name="location" value={editedUser.location} onChange={handleChangeUser} /> : user.location}</td>
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
        <Pagination total={filteredUsers.length} current={userPage} onPageChange={setUserPage} />
      </motion.div>
    </div>
  );
}

// Pagination Component
const Pagination = ({ total, current, onPageChange }: { total: number, current: number, onPageChange: (page: number) => void }) => {
  const pages = Math.ceil(total / 10);
  if (pages <= 1) return null;

  return (
    <div className="pagination">
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          className={current === i + 1 ? 'active' : ''}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default AdminOverview;
