'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LogoutButton from '../../components/LogoutButton';
import './AdminOverview.css';
// lastest order
import { createClient } from '@supabase/supabase-js';

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
  id: number;               // Maps to bookid
  title: string;
  isbn: string;
  authorid: number;
  publisherid: number;
  publish_year: number;
  categoryid: number;
  quantity: number;
  price: number;
  languageid: number;
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

interface Book {
  id: number;
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  published_year: number;
  category: string;
  quantity: number;
  price: number;
  language: string;
}

interface NewBookInput {
  id: number;
  title: string;
  isbn: string; // This will be auto-generated
  author: string; // Name instead of ID
  publisher: string; // Name instead of ID  
  category: string; // Name instead of ID
  language: string; // Name instead of ID
  publish_year: number;
  quantity: number;
  price: number;
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
  const [editedUser, setEditedUser] = useState<User>({ 
    firstname: '', 
    middlename: '', 
    lastname: '', 
    username: '', 
    email: '', 
    phone: '', 
    address: ''
  });

  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editedBook, setEditedBook] = useState<Book>({ 
    id: 0, 
    title: '', 
    isbn: '', 
    author: '', 
    publisher: '', 
    published_year: 0, 
    category: '', 
    quantity: 0, 
    price: 0,
    language: ''
  });

  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [newBook, setNewBook] = useState<BookStock>({ 
    id: 0, 
    title: '', 
    isbn: '', 
    authorid: 0, 
    publisherid: 0, 
    categoryid: 0, 
    languageid: 0, 
    publish_year: 0, 
    quantity: 0, 
    price: 0
  });

  const [books, setBooks] = useState<Book[]>([]);

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

  // Fetch books from book_with_details view
  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase.from("book_with_details").select("*");
      if (error) {
        console.error("Error fetching books:", error);
      } else {
        // Map the returned data to match our Book interface
        const formattedBooks = data.map(book => ({
          id: book.bookid || book.id,
          title: book.title || '',
          isbn: book.isbn || '',
          author: book.author || '',
          publisher: book.publisher || '',
          published_year: book.publish_year || book.published_year || 0,
          category: book.category || '',
          quantity: book.quantity || 0,
          price: book.price || 0,
          language: book.language || ''
        }));
        setBooks(formattedBooks);
      }
    };
    fetchBooks();
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

  const totalSales = orders.length>0 ? orders.reduce((sum, order) => {
    const priceNumber = parseFloat(order.price.replace('$', ''));
    return sum + priceNumber;
  }, 0).toFixed(2):'0.00';

  const cards = [
    { title: 'Total Sales', value: `$${totalSales}`, color: '#667eea' },
    { title: 'Total Orders', value: orders.length.toString(), color: '#ff758c' },
    { title: 'Total Users', value: users.length.toString(), color: '#43cea2' },
    { title: 'In Stock', value: books.reduce((acc, b) => acc + b.quantity, 0).toString(), color: '#f9ca24' },
  ];

  // Filtered Data for pagination
  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(userFilter.toLowerCase()));
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(bookFilter.toLowerCase()));

  const paginatedOrders = orders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * itemsPerPage, bookPage * itemsPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  // --- Handlers: User ---
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
      const bookToDelete = books.find(book => book.id === id);
      if (!bookToDelete) {
        console.log(`Book with ID ${id} not found`);
        return;
      }
      
      console.log(`Deleting book: ${bookToDelete.title} (ID: ${id})`);
      
      // Update local state first (optimistic update)
      const updated = books.filter(book => book.id !== id);
      setBooks(updated);
      
      // Then try API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const url = `${API_BASE_URL}/books/delete?id=${id}`;
      console.log("Delete URL:", url);
      console.log("Attempting to delete book with URL:", url);
      
      const response = await fetch(url, {
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
    const book = books.find(b => b.id === id);
    if (book) {
      setEditingBookId(id);
      setEditedBook(book);
    }
  };

  const handleSaveBook = async () => {
  if (editingBookId === null) return;
  if (!editedBook.author?.trim()) {
    setApiError("Author is required.");
    return;
  }
  if (!editedBook.publisher?.trim()) {
    setApiError("Publisher is required.");
    return;
  }
  if (!editedBook.category?.trim()) {
    setApiError("Category is required.");
    return;
  }
  if (!editedBook.language?.trim()) {
    setApiError("Language is required.");
    return;
  }

  try {
    const extractEntityId = (entity: any): number => {
      const idKey = Object.keys(entity).find(k => k.endsWith('id') && typeof entity[k] === 'number');
      if (idKey) return entity[idKey];
      console.error('Entity found but has invalid ID format:', entity);
      throw new Error('Invalid ID format in existing or new entity');
    };

    const createOrGetEntity = async (tableName: string, nameField: string, nameValue: string): Promise<number> => {
      if (!nameValue) return 1;

      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .ilike(nameField, nameValue)
        .limit(1);

      if (fetchError) throw new Error(`Failed to fetch ${tableName}: ${fetchError.message}`);

      if (data && data.length > 0) return extractEntityId(data[0]);

      const insertData = { [nameField]: nameValue };
      const { data: newData, error: insertError } = await supabase
        .from(tableName)
        .insert([insertData])
        .select();

      if (insertError) throw new Error(`Failed to create ${tableName}: ${insertError.message}`);
      if (!newData || newData.length === 0) throw new Error(`No data returned from ${tableName} insert`);

      return extractEntityId(newData[0]);
    };

    // Get IDs for referenced entities
    const authorId = await createOrGetEntity('author', 'authorname', editedBook.author);
    const publisherId = await createOrGetEntity('publisher', 'publishername', editedBook.publisher);
    const categoryId = await createOrGetEntity('category', 'categoryname', editedBook.category);
    const languageId = await createOrGetEntity('language', 'languagename', editedBook.language);

    // Build the update payload
    const bookData = {
      bookid: editingBookId,
      title: editedBook.title.trim(),
      isbn: editedBook.isbn.trim(),
      author: editedBook.author.trim(),
      publisher: editedBook.publisher.trim(),
      category: editedBook.category.trim(),
      language: editedBook.language.trim(),
      publish_year: Number(editedBook.published_year),
      quantity: Number(editedBook.quantity),
      price: Number(editedBook.price),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `${API_BASE_URL}/books/update`;

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
      const errorText = await response.text().catch(() => 'No error details');
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    // Update local state
    const updatedBooks = [...books];
    const bookIndex = updatedBooks.findIndex(book => book.id === editingBookId);
    if (bookIndex !== -1) {
      updatedBooks[bookIndex] = { ...editedBook };
      setBooks(updatedBooks);
    }

    setApiError(null);
    setEditingBookId(null);

  } catch (error) {
    console.error('Error updating book:', error);
    setApiError(`Failed to save book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  const handleChangeBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBook(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'price' || name === 'published_year' 
        ? Number(value) 
        : value 
    }));
  };

  const handleAddStock = () => {
  setAddingBook(true);
  // Generate a random ISBN
  const generateISBN = () => {
    // ISBN-13 format: 978 (prefix) + 10 random digits
    const prefix = '978';
    const randomPart = Array.from({length: 9}, () => Math.floor(Math.random() * 10)).join('');
    // Last digit is a check digit - using a simplified version here
    const checkDigit = Math.floor(Math.random() * 10);
    return `${prefix}${randomPart}${checkDigit}`;
  };

  setNewBook({ 
    id: Date.now(), 
    title: '', 
    isbn: generateISBN(), 
    authorid: 0,  // We'll keep these for backend compatibility
    publisherid: 0, 
    publish_year: new Date().getFullYear(), 
    categoryid: 0, 
    quantity: 1, 
    price: 0, 
    languageid: 0,
  });
};

  const handleChangeNewBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'price' || name === 'publish_year'
        ? Number(value) 
        : value 
    }));
  };

  const handleSaveNewBook = async () => {
  try {
    // Get form values from the UI
    const formTitle = (document.querySelector('input[name="title"]') as HTMLInputElement)?.value || '';
    const formAuthor = (document.querySelector('input[name="author"]') as HTMLInputElement)?.value || '';
    const formPublisher = (document.querySelector('input[name="publisher"]') as HTMLInputElement)?.value || '';
    const formCategory = (document.querySelector('input[name="category"]') as HTMLInputElement)?.value || '';
    const formLanguage = (document.querySelector('input[name="language"]') as HTMLInputElement)?.value || '';
    const formPublishYear = Number((document.querySelector('input[name="publish_year"]') as HTMLInputElement)?.value || new Date().getFullYear());
    const formQuantity = Number((document.querySelector('input[name="quantity"]') as HTMLInputElement)?.value || 0);
    const formPrice = Number((document.querySelector('input[name="price"]') as HTMLInputElement)?.value || 0);
    const formISBN = newBook.isbn; // Using the auto-generated ISBN

    // Validate required fields first
    if (!formTitle) {
      alert('Please enter a book title');
      return;
    }
    
    if (formPrice <= 0) {
      alert('Please enter a valid price (greater than 0)');
      return;
    }
    
    if (formQuantity <= 0) {
      alert('Please enter a valid quantity (greater than 0)');
      return;
    }
    
    if (!formAuthor) {
      alert('Please enter an author name');
      return;
    }

    // Show a loading/processing state
    setApiError("Processing... Please wait");

    // Helper function to create or get related entities
    const createOrGetEntity = async (tableName: string, nameField: string, nameValue: string): Promise<number> => {
  if (!nameValue) return 1;

  const extractEntityId = (entity: any): number => {
    const idKey = Object.keys(entity).find(k => k.endsWith('id') && typeof entity[k] === 'number');
    if (idKey) return entity[idKey];
    console.error('Entity found but has invalid ID format:', entity);
    throw new Error('Invalid ID format in existing or new ' + tableName);
  };

  try {
    console.log(`Checking if ${tableName} exists with ${nameField} = "${nameValue}"`);

    const { data, error: fetchError } = await supabase
      .from(tableName)
      .select("*")
      .ilike(nameField, nameValue)
      .limit(1);

    if (fetchError) {
      console.error(`Error fetching from ${tableName}:`, fetchError);
      throw new Error(`Failed to check existing ${tableName}: ${fetchError.message}`);
    }

    if (data && data.length > 0) {
      return extractEntityId(data[0]);
    }

    // Create new entity
    console.log(`Creating new ${tableName} with ${nameField} = "${nameValue}"`);
    const insertData = { [nameField]: nameValue };

    const { data: newData, error: insertError } = await supabase
      .from(tableName)
      .insert([insertData])
      .select();

    if (insertError) {
      console.error(`Error creating new ${tableName}:`, insertError);
      throw new Error(`Failed to create new ${tableName}: ${insertError.message}`);
    }

    if (!newData || newData.length === 0) {
      throw new Error(`No response returned when creating new ${tableName}`);
    }

    return extractEntityId(newData[0]);

  } catch (err) {
    console.error(`Error in createOrGetEntity for ${tableName}:`, err);
    console.warn(`Defaulting to ID 1 for ${tableName} due to error`);
    return 1;
  }
};
  
    // Process entities in sequence (for better error handling)
    let authorId, publisherId, categoryId, languageId;
    try {
      console.log("Starting to process related entities...");
      authorId = await createOrGetEntity('author', 'authorname', formAuthor);
      console.log(`Got authorId: ${authorId}`);
      publisherId = await createOrGetEntity('publisher', 'publishername', formPublisher);
      console.log(`Got publisherId: ${publisherId}`);
      categoryId = await createOrGetEntity('category', 'categoryname', formCategory);
      console.log(`Got categoryId: ${categoryId}`);
      languageId = await createOrGetEntity('language', 'languagename', formLanguage);
      console.log(`Got languageId: ${languageId}`);
    } catch (entityError) {
      console.error("Error processing entities:", entityError);
      setApiError(`Error processing related entities: ${entityError instanceof Error ? entityError.message : 'Unknown error'}`);
      return;
    }

    // Create the book with the retrieved/created IDs
    const bookData = {
      title: formTitle,
      isbn: formISBN,
      authorid: authorId,
      publisherid: publisherId,
      categoryid: categoryId,
      languageid: languageId,
      publish_year: formPublishYear,
      quantity: formQuantity,
      price: formPrice,
    };

    // Update local state first (optimistic UI)
    const updatedNewBook = {
      ...newBook,
      title: formTitle,
      quantity: formQuantity,
      price: formPrice,
      publish_year: formPublishYear,
      authorid: authorId,
      publisherid: publisherId,
      categoryid: categoryId,
      languageid: languageId
    };
    
    const updated = [...stock, updatedNewBook];
    setStock(updated);
    
    // Insert into Supabase
    const { data: insertedBook, error: insertError } = await supabase
      .from('book')
      .insert([bookData])
      .select();
      
    if (insertError) {
      throw new Error(`Book insert failed: ${insertError.message}`);
    }
    
    // Clear error state and form
    setApiError(null);
    setAddingBook(false);
    
    // Refresh books list
    const { data, error } = await supabase.from("book_with_details").select("*");
    if (error) {
      console.error("Error fetching books:", error);
    } else {
      // Map the returned data to match our Book interface
      const formattedBooks = data.map(book => ({
        id: book.bookid || book.id,
        title: book.title || '',
        isbn: book.isbn || '',
        author: book.author || '',
        publisher: book.publisher || '',
        published_year: book.publish_year || book.published_year || 0,
        category: book.category || '',
        quantity: book.quantity || 0,
        price: book.price || 0,
        language: book.language || ''
      }));
      setBooks(formattedBooks);
    }
    
    // Show success message
    alert('Book added successfully!');
    
  } catch (error) {
    console.error('Error adding new book:', error);
    setApiError(`Failed to add book: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    const parsedOrders: Order[] = refreshedOrders.filter((o: any) => {
      return o.paymentstatus !== 'Paid' || o.orderstatus !== 'Shipped';
    }).map((o: any) => ({
      id: o.orderid,
      orderDate: o.orderdate,
      username: 'Unknown',
      customerId: o.customerid,
      price: `$${o.totalamount.toFixed(2)}`,
      totalAmount: `$${o.totalamount.toFixed(2)}`,
      paymentMethod: o.paymentmethod,
      orderStatus: o.orderstatus === 'Shipped' ? 'success' : 'pending',
    }));

    setOrders(parsedOrders);
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
              <th>Order ID</th>
              <th>Order Date</th>
              <th>Customer ID</th>
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
        {apiError && <div className="error-message">{apiError}</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Publish Year</th>
              <th>Language</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{editingBookId === book.id ? <input name="title" value={editedBook.title} onChange={handleChangeBook} /> : book.title}</td>
                <td>{editingBookId === book.id ? <input name="isbn" value={editedBook.isbn} onChange={handleChangeBook} /> : book.isbn}</td>
                <td>{editingBookId === book.id ? <input name="category" value={editedBook.category} onChange={handleChangeBook} /> : book.category}</td>
                <td>{editingBookId === book.id ? <input name="quantity" type="number" value={editedBook.quantity} onChange={handleChangeBook} /> : book.quantity}</td>
                <td>{editingBookId === book.id ? <input name="price" type="number" step="0.01" value={editedBook.price} onChange={handleChangeBook} /> : book.price}</td>
                <td>{editingBookId === book.id ? <input name="author" value={editedBook.author} onChange={handleChangeBook} /> : book.author}</td>
                <td>{editingBookId === book.id ? <input name="publisher" value={editedBook.publisher} onChange={handleChangeBook} /> : book.publisher}</td>
                <td>{editingBookId === book.id ? <input name="published_year" type="number" value={editedBook.published_year} onChange={handleChangeBook} /> : book.published_year}</td>
                <td>{editingBookId === book.id ? <input name="language" value={editedBook.language} onChange={handleChangeBook} /> : book.language}</td>
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
              <tr key="new">
                <td>{newBook.id}</td>
                <td><input name="title" placeholder="Book Title" required /></td>
                <td><input name="isbn" value={newBook.isbn} disabled style={{backgroundColor: '#f0f0f0'}} /></td>
                <td><input name="category" placeholder="Category" /></td>
                <td><input name="quantity" type="number" min="1" defaultValue="1" /></td>
                <td><input name="price" type="number" step="0.01" min="0.01" placeholder="0.00" /></td>
                <td><input name="author" placeholder="Author Name" /></td>
                <td><input name="publisher" placeholder="Publisher Name" /></td>
                <td><input name="publish_year" type="number" min="1900" max="2100" defaultValue={new Date().getFullYear()} /></td>
                <td><input name="language" placeholder="Language" defaultValue="English" /></td>
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