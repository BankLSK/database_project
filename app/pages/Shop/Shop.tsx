'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import './Shop.css';

const products = [
  { id: 1, title: 'One Piece', price: 9.99, image: '/manga/onepiece.jpg' },
  { id: 2, title: 'Naruto', price: 8.99, image: '/manga/naruto.jpg' },
  { id: 3, title: 'Attack on Titan', price: 10.99, image: '/manga/aot.jpg' },
  { id: 4, title: 'Demon Slayer', price: 7.99, image: '/manga/demonslayer.jpg' },
];

function Shop() {
  const [cart, setCart] = useState<{ id: number; title: string; price: number }[]>([]);

  const handleAddToCart = (product: { id: number; title: string; price: number }) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

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
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.title} - ${item.price.toFixed(2)}
                <button onClick={() => handleRemoveFromCart(index)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <h3>Total: ${totalPrice}</h3>
      </div>
    </motion.div>
  );
}

export default Shop;
