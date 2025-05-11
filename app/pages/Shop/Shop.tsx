'use client';

import { useEffect, useState } from 'react';
import { motion, number } from 'framer-motion';
import './Shop.css';

/*const products = [
  { id: 1, title: 'One Piece', price: 9.99, image: '/manga/onepiece.jpg' },
  { id: 2, title: 'Naruto', price: 8.99, image: '/manga/naruto.jpg' },
  { id: 3, title: 'Attack on Titan', price: 10.99, image: '/manga/aot.jpg' },
  { id: 4, title: 'Demon Slayer', price: 7.99, image: '/manga/demonslayer.jpg' },
];*/




function Shop() {
  type Product={
    id:number;
    title:string;
    price:number;
    image:string;
  };

  type Customer={
    id:number;
    name:string;
    email:string;
  };

  const [products,setProducts]=useState<Product[]>([]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [selectedCustomerID,setSelectedCustomerID]=useState<number|null>(null);
  const [cart, setCart] = useState<{ id: number; title: string; price: number }[]>([]);
  //const [products, setProducts]=useState<{id: number; title: string; price:number; image:string }[]>([]);

  useEffect(()=>{
    fetch("http://localhost:8000/books")
    .then(res=>res.json())
    .then(data=>setProducts(data))
    .catch(err=>console.error("Failed to load books",err));
  },[]);

  useEffect(()=>{
    fetch("http://localhost:8000/customers")
    .then(res=>res.json())
    .then(data=>setCustomers(data))
    .catch(err=>console.error("Failed to load customer",err));
  },[]);

  const handleAddToCart = (product: { id: number; title: string; price: number }) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handleConfirmPurchase = () => {
    alert('Thank you for your purchase!');
    setCart([]);
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
            <p>${product.price}</p>
            <button onClick={() => handleAddToCart(product)}>Add   to Cart</button>
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
