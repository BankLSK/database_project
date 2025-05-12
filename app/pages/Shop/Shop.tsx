'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Import useAuth from your AuthContext
import './Shop.css';

const products = [
  { id: 1, title: 'One Piece', price: 9.99, image: '/manga/onepiece.jpg' },
  { id: 2, title: 'Naruto', price: 8.99, image: '/manga/naruto.jpg' },
  { id: 3, title: 'Attack on Titan', price: 10.99, image: '/manga/aot.jpg' },
  { id: 4, title: 'Demon Slayer', price: 7.99, image: '/manga/demonslayer.jpg' },
];

const paymentMethods = [
  { id: 'credit', name: 'Credit Card' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'debit', name: 'Debit Card' },
  { id: 'bank', name: 'Bank Transfer' },
];

function Shop() {
  const [cart, setCart] = useState<{ id: number; title: string; price: number }[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const router = useRouter();
  const { isLoggedIn, role } = useAuth(); // Get authentication state from context
  
  // Retrieve saved cart if it exists
  useEffect(() => {
    const savedCart = localStorage.getItem('savedCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      localStorage.removeItem('savedCart'); // Clear saved cart after retrieving
    }
  }, []);

  const handleAddToCart = (product: { id: number; title: string; price: number }) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handleConfirmPurchase = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedPayment) {
      alert('Please select a payment method before confirming your purchase');
      return;
    }

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Create order
    const newOrder = {
      id: Date.now(),
      orderDate: new Date().toISOString().split('T')[0],
      username: currentUser.username || 'guest',
      customerId: currentUser.id || Math.floor(Math.random() * 1000), // Fallback random ID
      book: cart.map(item => item.title).join(', '),
      price: cart.map(item => `${item.price.toFixed(2)}`).join(', '),
      totalAmount: `${totalPrice}`,
      paymentMethod: paymentMethods.find(pm => pm.id === selectedPayment)?.name || selectedPayment,
      orderStatus: 'pending'
    };

    // Store the order in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([...existingOrders, newOrder]));

    alert('Thank you for your purchase! Your order has been placed.');
    setCart([]);
    setSelectedPayment('');
  };

  const navigateToLogin = () => {
    // Store current cart in localStorage to restore it after login
    localStorage.setItem('savedCart', JSON.stringify(cart));
    router.push('/login'); // Navigate to login page
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
            <p>${product.price.toFixed(2)}</p>
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
                  {item.title} - ${item.price.toFixed(2)}
                  <button className="remove-button" onClick={() => handleRemoveFromCart(index)}>Remove</button>
                </li>
              ))}
            </ul>
            <h3>Total: ${totalPrice}</h3>
            
            {/* Payment Method Selection */}
            <div className="payment-methods">
              <h4>Select Payment Method:</h4>
              <div className="payment-options">
                {paymentMethods.map(method => (
                  <div key={method.id} className="payment-option">
                    <input
                      type="radio"
                      id={method.id}
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                    />
                    <label htmlFor={method.id}>{method.name}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="confirm-button" onClick={handleConfirmPurchase}>
              Confirm Purchase
            </button>
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h3>Login Required</h3>
            <p>You need to login before completing your purchase.</p>
            <div className="modal-buttons">
              <button onClick={navigateToLogin}>Go to Login</button>
              <button onClick={() => setShowLoginModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Shop;