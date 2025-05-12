'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import './showcase.css';

interface BookStock {
  id: number;
  title: string;
  category: string;
  quantity: number;
  price: string;
}

export default function ShowcasePage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const [books, setBooks] = useState<BookStock[]>([]);

  useEffect(() => {
    const storedStock = localStorage.getItem('stock');
    const parsedStock: BookStock[] = storedStock ? JSON.parse(storedStock) : [];
    const filtered = parsedStock.filter(
      book => book.category.toLowerCase() === category.toLowerCase()
    );
    setBooks(filtered);
  }, [category]);

  const handleAddToCart = (book: BookStock) => {
    if (book.quantity < 1) {
      alert('Out of stock!');
      return;
    }

    // Update cart
    const storedCart = localStorage.getItem('cart');
    const cart = storedCart ? JSON.parse(storedCart) : [];
    cart.push({ id: book.id, title: book.title, price: parseFloat(book.price.replace('$', '')) });
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update stock
    const storedStock = localStorage.getItem('stock');
    const stock: BookStock[] = storedStock ? JSON.parse(storedStock) : [];
    const updatedStock = stock.map(b =>
      b.id === book.id ? { ...b, quantity: b.quantity - 1 } : b
    );
    localStorage.setItem('stock', JSON.stringify(updatedStock));

    // Update local state
    const updatedBooks = books.map(b =>
      b.id === book.id ? { ...b, quantity: b.quantity - 1 } : b
    );
    setBooks(updatedBooks);

    alert(`${book.title} added to cart`);
  };

  return (
    <motion.div
      className="showcase-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="showcase-title">{category} Collection</h1>

      {books.length === 0 ? (
        <p>No books found in this category.</p>
      ) : (
        <table className="showcase-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.category}</td>
                <td>{book.quantity}</td>
                <td>{book.price}</td>
                <td>
                  <button
                    onClick={() => handleAddToCart(book)}
                    disabled={book.quantity < 1}
                  >
                    {book.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}
