'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Shop.css';

const initialProducts = [
  { id: 1, title: 'One Piece', price: 9.99, image: '/manga/onepiece.jpg', stock: 10 },
  { id: 2, title: 'Naruto', price: 8.99, image: '/manga/naruto.jpg', stock: 8 },
  { id: 3, title: 'Attack on Titan', price: 10.99, image: '/manga/aot.jpg', stock: 5 },
  { id: 4, title: 'Demon Slayer', price: 7.99, image: '/manga/demonslayer.jpg', stock: 7 },
];

type Product = typeof initialProducts[number];

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);

  // Load products and cart from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    const storedCart = localStorage.getItem('cart');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('products', JSON.stringify(initialProducts));
    }

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const updateCart = (newCart: Product[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Out of stock!');
      return;
    }

    const updatedCart = [...cart, product];
    updateCart(updatedCart);
  };

 const handleRemoveFromCart = (index: number) => {
  const updatedCart = [...cart];
  const removedItem = updatedCart.splice(index, 1)[0];

  // Restore stock
  const updatedProducts = products.map(p =>
    p.id === removedItem.id ? { ...p, stock: p.stock + 1 } : p
  );

  updateProducts(updatedProducts);
  updateCart(updatedCart);
};


  const handleConfirmPurchase = () => {
    const updatedProducts = [...products];

    for (const item of cart) {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.id);
      if (prodIndex !== -1 && updatedProducts[prodIndex].stock > 0) {
        updatedProducts[prodIndex].stock -= 1;
      }
    }

    updateProducts(updatedProducts);
    updateCart([]);
    alert('Purchase confirmed!');
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  const cartItems=cart.reduce((acc, item)=>{
    const existing=acc.find(i=>i.book_id===item.id);
    if (existing){
      existing.quantity+=1;
      existing.subtotal+=item.price;
    }else{
      acc.push({
        book_id:item.id,
        quantity: 1,
        unit_price: item.price,
        subtotal: item.price
      });
    }

    return acc;
  },[] as {
    book_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[]);

  const handleCheckout=async()=>{
    try{
      const latestStock=await fetch("http://localhost:8000/books")
      .then ((res)=> res.json())
      .catch(()=>{
        alert("Impossible to retrieve the current stock");
        return [];
      });

      for (const cartItem of cart){
        const book=latestStock.find((b:any)=>b.id===cartItem.id);
        if (!book){
          alert("Book ID${cartItem.id} not found");
          return;
        }

        const countInCart=cart.filter((i)=>i.id===cartItem.id).length;
        if (countInCart> book.stock){
          alert('Not enough in stock "${book.title}"(stock:${book.stock}, cartt:${countInCart})');
          return;
        }
      }
      const saleData={
        customer_id:selectedCustomerID,
        staff_id:1,
        payment_method:"card",
        payment_status:"paid",
        items:cart.reduce((acc,product)=>{
                const existing = acc.find(i => i.book_id === product.id);
          if (existing) {
            existing.quantity += 1;
            existing.subtotal += product.price;
          } else {
            acc.push({
              book_id: product.id,
              quantity: 1,
              unit_price: product.price,
              subtotal: product.price
            });
          }
          return acc;
        }, [] as {
          book_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
        }[])
      }
      const response =await fetch('http://localhost:8000/orders',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(saleData)
      });
      if (!response.ok) throw new Error('Checkout has failed');

      const data=await response.json();
      alert('Thank you for your purchase!');
      setCart([]);
    }
    catch (err){
      console.error(err);
      alert('Error while processing checkout')
    }
  };
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
            <p>Stock: {product.stock}</p>
            <button 
              disabled={product.stock === 0}
              onClick={() => handleAddToCart(product)}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="cart-details">
        <h2>🛒 Your Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  {item.title} - ${item.price.toFixed(2)} 
                  <button onClick={() => handleRemoveFromCart(index)}>Remove</button>
                </li>
              ))}
            </ul>
            <h3>Total: ${totalPrice}</h3>
            <button className="confirm-button" onClick={handleCheckout}>
              Confirm Purchase
            </button>
          </>
        )}
        <h3>Total: ${totalPrice}</h3>
        <div>
          <label htmlFor="customers">Select Customer:</label>
          <select
          id="customer"
          value={selectedCustomerID ?? ""}
          onChange={(e)=>setSelectedCustomerID(Number(e.target.value))}>
            <option value="">-- Chooose a customer --</option>
            {
              customers.map((c)=>(
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))
            }
          </select>
        </div>
      </div>
    </motion.div>
  );
}

export default Shop;
