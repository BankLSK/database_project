'use client';

import { Home } from './pages/Home/Home';
import { AdminOverview } from './pages/AdminOverview/AdminOverview';
import { CartProvider } from './context/CartContext';

// Admin versions (you can create simple placeholders for now)
import { useAuth } from '@/app/context/AuthContext';

export default function Page() {
  const { role } = useAuth();

  return (
    <CartProvider>
    <div>
      {role === 'admin' ? <AdminOverview /> : <Home />}
    </div>
    </CartProvider>
  );
}