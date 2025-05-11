'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import './Shop.css';

const products = [
  { id: 1, title: 'One Piece', price: 9.99, image: '/manga/onepiece.jpg' },
  { id: 2, title: 'Naruto', price: 8.99, image: '/manga/naruto.jpg' },
  { id: 3, title: 'Attack on Titan', price: 10.99, image: '/manga/aot.jpg' },
  { id: 4, title: 'Demon Slayer', price: 7.99, image: '/manga/demonslayer.jpg' },
];

function Shop() {
  const [cart, setCart] = useState<{ id: number; title: string; price: number; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, customerId } = useAuth();
  const router = useRouter();
  

  const handleAddToCart = (product: { id: number; title: string; price: number }) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handleConfirmPurchase = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const orderId = Math.floor(Math.random() * 1_000_000_000); // Generates a safe int4

    const payload = {
        customerid: customerId,
        orderid: orderId,
        items: cart.map(item => ({
        bookid: item.id,
        quantity: item.quantity,
        unitprice: item.price
      }))
    };
  
    try {
      // Using try-catch with error boundaries to handle network issues
      const res = await fetch('http://localhost:8080/confirmpurchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      alert('Thank you for your purchase!');
      setCart([]);
    } catch (err) {
      console.error('Purchase confirmation error:', err);
      setError(err instanceof Error ? err.message : 'Error confirming purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  return (
    <motion.div 
      className="shop"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="shop-header">
        <h1>Shop Manga</h1>
        <div className="cart">🛒 {cart.length}</div>
      </div>

      <div className="shop-grid">
        {products.map((product) => (
          <motion.div 
            key={product.id} 
            className="shop-card"
            whileHover={{ scale: 1.05 }}
          >
            <img src={product.image} alt={product.title} />
            <h2>{product.title}</h2>
            <p>${product.price}</p>
            <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
          </motion.div>
        ))}
      </div>

      {/* Cart Section */}
      <div className="cart-details">
        <h2>🛒 Your Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart yet.</p>
        ) : (
          <>
            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  {item.title} - ${item.price.toFixed(2)} x {item.quantity}
                  <button onClick={() => handleRemoveFromCart(index)}>Remove</button>
                </li>
              ))}
            </ul>
            <h3>Total: ${totalPrice}</h3>
            <button 
              className="confirm-button" 
              onClick={handleConfirmPurchase}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Purchase'}
            </button>
            
            {error && <p className="error-message">{error}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Shop;