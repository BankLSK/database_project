'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './showcase.css';

interface BookStock {
  id: number;
  title: string;
  category: string;
  quantity: number;
  price: number;
}

export default function ShowcasePage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const [books, setBooks] = useState<BookStock[]>([]);
  const { addToCart } = useCart(); //use cart context

  useEffect(() => {
    if (!category) return;

    const fetchBooks = async () => {
      try {
        const res = await fetch(`http://localhost:8080/getbooks?category=${encodeURIComponent(category)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await res.json();
        console.log("Fetched books:", data);

        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        setBooks(data);
        localStorage.setItem('stock', JSON.stringify(data));
      } catch (err) {
        console.error('Fetch error:', err);
        setBooks([]);  // fallback to empty array to avoid crash
      }
    };

    fetchBooks();
  }, [category]);

  useEffect(() => {
    console.log('Books being rendered:', books);
  }, [books]);

  const handleAddToCart = (book: BookStock) => {
    if (book.quantity < 1) {
      alert('Out of stock!');
      return;
    }

    // Add to cart using context
    addToCart({ id: book.id, title: book.title, price: book.price, quantity: 1 });

    // Update book list to reflect stock decrease
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
            {books.map((book, index) => (
              <tr key={`${book.id ?? 'book'}-${index}`}>
                <td>{book.title}</td>
                <td>{book.category}</td>
                <td>{book.quantity}</td>
                <td>${book.price.toFixed(2)}</td>
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
