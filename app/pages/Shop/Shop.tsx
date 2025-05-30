'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {useCart} from '../../context/CartContext'
import './Shop.css';

const products = [
  { id: 1, title: 'One Piece', price: 9.99, image: '/manga/onepiece.jpg' },
  { id: 2, title: 'Naruto', price: 8.99, image: '/manga/naruto.jpg' },
  { id: 3, title: 'Attack on Titan', price: 10.99, image: '/manga/aot.jpg' },
  { id: 4, title: 'Demon Slayer', price: 7.99, image: '/manga/demonslayer.jpg' },
  { id: 5, title: 'Solo Leveling',price:9.99,image:'/manga/sololeveling.jpg'},
  { id: 6, title: 'Shangri-La Frontier',price:8.49,image:'/manga/shangrila.jpg'},
  { id: 7, title: 'Dr.Stone', price:9.49,image:'/manga/drstone.jpg'},
  { id: 8, title: 'Re:Zero',price:8.99 ,image:'/manga/rezero.jpg'},
  { id: 9, title: 'Fire Force',price:7.99, image: '/manga/fireforce.jpg'},
  { id:10, title: 'My Hero Academia',price:8.99 ,image:'/manga/mma.jpg'},
];

const paymentMethods = [
  { id: 'credit', name: 'Credit Card' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'debit', name: 'Debit Card' },
  { id: 'bank', name: 'Bank Transfer' },
];

function Shop() {
  const { isAuthenticated, customerId } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart(); // ✅ Use cart context
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const savedCart = localStorage.getItem('savedCart');
    if (savedCart) {
      //setCart(JSON.parse(savedCart));
      localStorage.removeItem('savedCart');
    }
  }, []);

  /*const handleAddToCart = (product: { id: number; title: string; price: number }) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };*/
  const handleAddToCart = (product: { id: number; title: string; price: number }) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1, // le contexte s'occupera d'augmenter si besoin
    });
  };  

  /*const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };*/
  const handleRemoveFromCart = (id: number) => {
    console.log("Bouton",id)
    removeFromCart(id);
  };

  const handleConfirmPurchase = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!selectedPayment) {
      alert('Please select a payment method before confirming your purchase');
      return;
    }

    setIsLoading(true);
    setError(null);

    const orderId = Math.floor(Math.random() * 1_000_000_000);
    const payload = {
      customerid: customerId,
      orderid: orderId,
      items: cart.map(item => ({
        bookid: item.id,
        quantity: item.quantity,
        unitprice: item.price
      })),
      paymentMethod: paymentMethods.find(pm => pm.id === selectedPayment)?.name || selectedPayment,
    };

    try {
      const res = await fetch('http://localhost:8080/confirmpurchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);

      alert('Thank you for your purchase!');
      localStorage.removeItem('cart'); // Optional: context can also expose a `clearCart()` method
      location.reload(); // quick refresh to clear context (or use a proper clear function)
      //setCart([]);
      setSelectedPayment('');
    } catch (err) {
      console.error('Purchase confirmation error:', err);
      setError(err instanceof Error ? err.message : 'Error confirming purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  //const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
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
        {products.map(product => (
          <motion.div key={product.id} className="shop-card" whileHover={{ scale: 1.05 }}>
            <img src={product.image} alt={product.title} />
            <h2>{product.title}</h2>
            <p>${product.price.toFixed(2)}</p>
            <button onClick={() => addToCart({ ...product, quantity: 1 })}>Add to Cart</button>
          </motion.div>
        ))}
      </div>

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
                  <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <h3>Total: ${totalPrice}</h3>

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

            <button className="confirm-button" onClick={handleConfirmPurchase} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Purchase'}
            </button>

            {error && <p className="error-message">{error}</p>}
          </>
        )}
      </div>

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
