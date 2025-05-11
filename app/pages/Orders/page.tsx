'use client';
import { useEffect, useState } from 'react';

type Order = {
  id: string;
  timestamp: string;
  customer_id: number | null;
  staff_id: number;
  payment_method: string;
  payment_status: string;
  items: {
    book_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/orders")
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">🧾 Order History</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded-md shadow-sm">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
              <p><strong>Customer:</strong> {order.customer_id ?? "Guest"}</p>
              <p><strong>Total:</strong> {order.items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)} €</p>
              <p><strong>Items:</strong> {order.items.length}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
