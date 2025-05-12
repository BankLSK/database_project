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
  author: string;
  publisher: string;
  publishYear: number;
  language: string;
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



// lastest order connect supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE_URL = 'http://localhost:8080';

export function AdminOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [stock, setStock] = useState<BookStock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);


  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<User>({ firstname: '', lastname: '', username: '', email: '', middlename: '', phone: '', address: '' });
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editedBook, setEditedBook] = useState<BookStock>({ id: 0, title: '', category: '', quantity: 0, price: '' , author: '', publisher: '', language:'', publishYear: 0});

  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [newBook, setNewBook] = useState<BookStock>({ id: 0, title: '', category: '', quantity: 0, price: '' , author: '', publisher: '', language:'', publishYear: 0});

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
 
  useEffect(() => {
  // Safe parse pour array
  const safeParseArray = <T,>(raw: string | null, fallback: T[]): T[] => {
    try {
      const parsed = JSON.parse(raw || 'null');
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const storedUsers = safeParseArray<User>(localStorage.getItem('users'), []);
  setUsers(storedUsers);

  const storedStock = safeParseArray<BookStock>(localStorage.getItem('stock'), []);
  setStock(storedStock);

  const defaultOrders: Order[] = [
    { 
      id: 1, 
      orderDate: '2025-05-10', 
      username: 'JohnDoe', 
      customerId: 101, 
      book: 'One Piece Vol.1', 
      price: '$12.99',
      totalAmount: '$12.99',
      paymentMethod: 'Credit Card',
      orderStatus: 'pending'
    },
    { 
      id: 2, 
      orderDate: '2025-05-09', 
      username: 'JaneSmith', 
      customerId: 102, 
      book: 'Naruto Vol.5', 
      price: '$10.99',
      totalAmount: '$10.99',
      paymentMethod: 'PayPal',
      orderStatus: 'pending'
    },
    { 
      id: 3, 
      orderDate: '2025-05-08', 
      username: 'CoolGuy', 
      customerId: 103, 
      book: 'Attack on Titan Vol.2', 
      price: '$15.99',
      totalAmount: '$15.99',
      paymentMethod: 'Debit Card',
      orderStatus: 'success'
    },
  ];

  const storedOrders = safeParseArray<Order>(localStorage.getItem('orders'), defaultOrders);
  setOrders(storedOrders);

}, []);


  const totalSales = orders.length>0 ? orders.reduce((sum, order) => {

    const priceNumber = parseFloat(order.price.replace('$', ''));
    return sum + priceNumber;
  }, 0).toFixed(2):'0.00';

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
   const handleDeleteBook = async (id: number) => {
  try {
    // Show pending state
    const bookToDelete = stock.find(book => book.id === id);
    if (!bookToDelete) {
      console.log(`Book with ID ${id} not found`);
      return;
    }
    
    console.log(`Deleting book: ${bookToDelete.title} (ID: ${id})`);
    
    // Update local state first (optimistic update)
    const updated = stock.filter(book => book.id !== id);
    setStock(updated);
    localStorage.setItem('stock', JSON.stringify(updated));
    
    // Then try API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const url = `${API_BASE_URL}/deletebook/${id}`;
    console.log("Delete URL:", url);
    console.log("Attempting to delete book with URL:", url);
    
    const response = await fetch(`${API_BASE_URL}/books/delete?id=${id}`, {
      method: 'DELETE',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    setApiError(null);
    console.log(`Book ${id} deleted successfully from API`);
    
  } catch (error) {
    console.error('Error deleting book from API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setApiError(`Warning: Backend sync failed. Book deleted locally only. (${errorMessage})`);
  }
};

  const handleEditBook = (id: number) => {
    const book = stock.find(b => b.id === id);
    if (book) {
      setEditingBookId(id);
      setEditedBook(book);
    }
  };

  const handleSaveBook = async () => {
  if (editingBookId === null) return;

  try {
    // Log what we're attempting to save
    console.log("Attempting to save book with ID:", editingBookId);
    console.log("Book data:", editedBook);
    
    // Optimistic UI update first
    const updatedStock = stock.map(book => book.id === editingBookId ? editedBook : book);
    setStock(updatedStock);
    localStorage.setItem('stock', JSON.stringify(updatedStock));
    
    // Format data for API
    const bookData = {
      bookid: editingBookId,
      title: editedBook.title || "",
      category: editedBook.category || "",
      quantity: Number(editedBook.quantity) || 0,
      price: parseFloat((editedBook.price || "").replace('$', '')) || 0,
      author: editedBook.author || "",
      publisher: editedBook.publisher || "",
      language: editedBook.language || "",
      publish_year: Number(editedBook.publishYear) || 2024,
    };
    
    console.log("Formatted data for API:", bookData);
    
    // Then try API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use the correct endpoint
    const url = `${API_BASE_URL}/books/update`;
    console.log("Making PUT request to:", url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to get more detailed error info
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`Server error (${response.status}):`, errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }
    
    setApiError(null);
    console.log("Book saved successfully");

  } catch (error) {
    console.error('Error updating book:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setApiError(`Warning: Backend sync failed. Changes saved locally only. (${errorMessage})`);
  } finally {
    setEditingBookId(null);
  }
};

  const handleChangeBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBook(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleAddStock = () => {
    setAddingBook(true);
    setNewBook({ id: Date.now(), title: '', category: '', quantity: 0, price: '' , author: '', publisher: '', language:'', publishYear: 0 });
  };

  const handleChangeNewBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSaveNewBook = async () => {
    try {
      // Validate required fields first
      if (!newBook.title || !newBook.category) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Format price properly if needed
      const formattedPrice = newBook.price.startsWith('$') ? newBook.price : `$${newBook.price}`;
      const bookToAdd = {...newBook, price: formattedPrice};
      
      // Update local state first (optimistic UI)
      const updated = [...stock, bookToAdd];
      setStock(updated);
      localStorage.setItem('stock', JSON.stringify(updated));
      setAddingBook(false);
      
      // Then try API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/addbook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newBook.title,
          isbn: String(newBook.id), // or generate real ISBN if applicable
          author: newBook.author || 'Unknown',
          publisher: newBook.publisher || 'Unknown',
          category: newBook.category,
          language: newBook.language || 'English',
          publish_year: newBook.publishYear || 2024,
          quantity: newBook.quantity,
          price: parseFloat(newBook.price.replace('$', '')) || 0,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      setApiError(null);
      
    } catch (error) {
      console.error('Error adding new book:', error);
      setApiError("Warning: Backend sync failed. Changes saved locally only.");
    }
  };

 
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
                <td>{editingBookId === book.id ? <input name="author_id" value={editedBook.author} onChange={handleChangeBook} /> : book.author}</td>
                <td>{editingBookId === book.id ? <input name="publisher_id" value={editedBook.publisher} onChange={handleChangeBook} /> : book.publisher}</td>
                <td>{editingBookId === book.id ? <input name="publish_year" value={editedBook.publishYear} onChange={handleChangeBook} /> : book.publishYear}</td>
                <td>{editingBookId === book.id ? <input name="language_id" value={editedBook.language} onChange={handleChangeBook} /> : book.language}</td>
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
                <td><input name="author_id" value={newBook.author} onChange={handleChangeNewBook} /></td>
                <td><input name="publisher_id" value={newBook.publisher} onChange={handleChangeNewBook} /></td>
                <td><input name="publish_year" value={newBook.publishYear} onChange={handleChangeNewBook} /></td>
                <td><input name="language_id" value={newBook.language} onChange={handleChangeNewBook} /></td>
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