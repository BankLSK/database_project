'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LogoutButton from '../../components/LogoutButton';
import './AdminOverview.css';
// lastest order
import { createClient } from '@supabase/supabase-js';
//
//=========================== struct ===========================

interface User {
  firstname: string;
  middlename: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface BookStock {
  id: number;
  title: string;
  category: string;
  quantity: number;
  price: string;
  author_id: string;
  publisher_id: string;
  publish_year: string;
  language_id: string;
}

interface Order {
  id: number;
  orderDate: string;
  username: string;
  customerId: number;
  // book: string;
  price: string;
  totalAmount: string;
  paymentMethod: string;
  orderStatus: 'pending' | 'success';
}

//=================================================================================

// lastest order connect supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

//=================================================================================

export function AdminOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [stock, setStock] = useState<BookStock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<User>({ firstname: '', lastname: '', username: '', email: '', middlename: '', phone: '', address: '' });
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editedBook, setEditedBook] = useState<BookStock>({ id: 0, title: '', category: '', quantity: 0, price: '' , author_id: '', publisher_id: '', publish_year:'', language_id:''});

  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [newBook, setNewBook] = useState<BookStock>({ id: 0, title: '', category: '', quantity: 0, price: '' , author_id: '', publisher_id: '', publish_year:'', language_id:''});

//=================================================================================
  // Pagination states
  const [orderPage, setOrderPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 10;

  // manage user table
  useEffect(() => {
    const fetchUsers = async () => {
      const { data: usersData, error } = await supabase
        .from('customer') // Replace 'users' with your actual table name
        .select(`
          firstname,
          middlename,
          lastname,
          username,
          email,
          phone,
          address
        `);

      if (error) {
        console.error('Error fetching users:', error.message);
        return;
      }

      setUsers(usersData || []);
    };

    fetchUsers();
  }, []);

 
  // lastest order table
  useEffect(() => {
    const fetchData = async () => {
      // Fetch orders
      const { data: ordersData, error: orderError } = await supabase
        .from('ordersmain')
        .select(`
          orderid,
          orderdate,
          customerid,
          totalamount,
          paymentmethod,
          orderstatus,
          paymentstatus
        `)
        .order('orderid', { ascending: false });

      if (orderError) {
        console.error('Error fetching orders:', orderError.message);
        return;
      }

      const incompleteOrders = (ordersData || []).filter((o: any) => {
        return o.paymentstatus !== 'Paid' || o.orderstatus !== 'Shipped';
      });

      // Optionally join customer or book data later
      const parsedOrders: Order[] = incompleteOrders.map((o: any) => ({
        id: o.orderid,
        orderDate: o.orderdate,
        username: 'Unknown', // Could join customer.username later
        customerId: o.customerid,
        // book: '-', // You can fetch book titles later from order_details
        price: `$${o.totalamount.toFixed(2)}`,
        totalAmount: `$${o.totalamount.toFixed(2)}`,
        paymentMethod: o.paymentmethod,
        orderStatus: o.orderstatus === 'success' ? 'success' : 'pending',
      }));

      setOrders(parsedOrders);
    };

    fetchData();
  }, []);

//
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
  // const handleDeleteUser = (index: number) => {
  //   const updated = [...users];
  //   updated.splice(index, 1);
  //   setUsers(updated);
  //   localStorage.setItem('users', JSON.stringify(updated));
  // };

  // const handleSaveUser = (index: number) => {
  //   const updated = [...users];
  //   updated[index] = editedUser;
  //   setUsers(updated);
  //   localStorage.setItem('users', JSON.stringify(updated));
  //   setEditingUserIndex(null);
  // };
  const handleSaveUser = async (index: number) => {
    const userToUpdate = users[index];
    const { error } = await supabase
      .from('customer')
      .update(editedUser)
      .eq('username', userToUpdate.username); // Assuming 'username' is unique

    if (error) {
      console.error('Error updating user:', error.message);
      return;
    }

    const updatedUsers = [...users];
    updatedUsers[index] = editedUser;
    setUsers(updatedUsers);
    setEditingUserIndex(null);
  };

  const handleDeleteUser = async (index: number) => {
    const userToDelete = users[index];
    const { error } = await supabase
      .from('customer')
      .delete()
      .eq('username', userToDelete.username); // Assuming 'username' is unique

    if (error) {
      console.error('Error deleting user:', error.message);
      return;
    }

    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
  };

  const handleEditUser = (index: number) => {
    setEditingUserIndex(index);
    setEditedUser(users[index]);
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
    setNewBook({ id: Date.now(), title: '', category: '', quantity: 0, price: '' , author_id: '', publisher_id: '', publish_year:'', language_id:'' });
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

  // // --- Handler: Confirm Payment ---
  // const handleConfirmPayment = (orderId: number) => {
  //   const updatedOrders = orders.map(order => 
  //     order.id === orderId ? { ...order, orderStatus: 'success' as const } : order
  //   );
  //   setOrders(updatedOrders);
  //   localStorage.setItem('orders', JSON.stringify(updatedOrders));
  // };
// latest order
const handleConfirmPayment = async (orderId: number) => {
  const { error } = await supabase
    .from('ordersmain')
    .update({
      paymentstatus: 'Paid',
      orderstatus: 'Shipped'
    })
    .eq('orderid', orderId);

  if (error) {
    console.error('Failed to update order status:', error.message);
    return;
  }

  // Refresh orders from Supabase
  const { data: refreshedOrders, error: fetchError } = await supabase
    .from('ordersmain')
    .select(`
      orderid,
      orderdate,
      customerid,
      totalamount,
      paymentmethod,
      orderstatus,
      paymentstatus
    `)
    .order('orderid', { ascending: false });

  if (fetchError) {
    console.error('Failed to refresh orders:', fetchError.message);
    return;
  }

  const parsedOrders: Order[] = refreshedOrders.map((o: any) => ({
    id: o.orderid,
    orderDate: o.orderdate,
    username: 'Unknown',
    customerId: o.customerid,
    book: '-',
    price: `$${o.totalamount.toFixed(2)}`,
    totalAmount: `$${o.totalamount.toFixed(2)}`,
    paymentMethod: o.paymentmethod,
    orderStatus: o.orderstatus === 'Shipped' ? 'success' : 'pending',
  }));

  setOrders(parsedOrders);
};
//
  

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
              <th>Order ID</th>
              <th>Order Date</th>
              <th>Customer ID</th>
              {/* <th>Book</th> */}
              <th>Price</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Order Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.orderDate}</td>
                <td>{order.customerId}</td>
                {/* <td>{order.book}</td> */}
                <td>{order.price}</td>
                <td>{order.totalAmount}</td>
                <td>{order.paymentMethod}</td>
                <td>
                  <span className={`status-badge ${order.orderStatus}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                </td>
                <td className="admin-actions">
                  {order.orderStatus === 'pending' && (
                    <button 
                      className="confirm"
                      onClick={() => handleConfirmPayment(order.id)}
                    >
                      Confirm Payment
                    </button>
                  )}
                </td>
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
              <th>Author ID</th>
              <th>Publisher ID</th>
              <th>Publish Year</th>
              <th>Language ID</th>
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
                <td>{editingBookId === book.id ? <input name="Author ID" value={editedBook.author_id} onChange={handleChangeBook} /> : book.author_id}</td>
                <td>{editingBookId === book.id ? <input name="Publisher ID" value={editedBook.publisher_id} onChange={handleChangeBook} /> : book.publisher_id}</td>
                <td>{editingBookId === book.id ? <input name="Publish Year" value={editedBook.publish_year} onChange={handleChangeBook} /> : book.publish_year}</td>
                <td>{editingBookId === book.id ? <input name="language ID" value={editedBook.language_id} onChange={handleChangeBook} /> : book.language_id}</td>
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
                <td><input name="Author ID" value={newBook.author_id} onChange={handleChangeNewBook} /></td>
                <td><input name="Publisher ID" value={newBook.publisher_id} onChange={handleChangeNewBook} /></td>
                <td><input name="Publish Year" value={newBook.publish_year} onChange={handleChangeNewBook} /></td>
                <td><input name="language ID" value={newBook.language_id} onChange={handleChangeNewBook} /></td>
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
              <th>Username</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr key={index}>
                <td>{editingUserIndex === index ? <input name="username" value={editedUser.username} onChange={handleChangeUser} /> : user.username}</td>
                <td>{editingUserIndex === index ? <input name="firstname" value={editedUser.firstname} onChange={handleChangeUser} /> : user.firstname}</td>
                <td>{editingUserIndex === index ? <input name="middlename" value={editedUser.middlename} onChange={handleChangeUser} /> : user.middlename}</td>
                <td>{editingUserIndex === index ? <input name="lastname" value={editedUser.lastname} onChange={handleChangeUser} /> : user.lastname}</td>
                <td>{editingUserIndex === index ? <input name="email" value={editedUser.email} onChange={handleChangeUser} /> : user.email}</td>
                <td>{editingUserIndex === index ? <input name="phone" value={editedUser.phone} onChange={handleChangeUser} /> : user.phone}</td>
                <td>{editingUserIndex === index ? <input name="address" value={editedUser.address} onChange={handleChangeUser} /> : user.address}</td>
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