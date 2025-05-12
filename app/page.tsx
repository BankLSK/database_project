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


// import Collection from './pages/Collection';
// import { BestSeller } from './BestSeller/BestSeller';
// import Shop from './pages/Shop';
// import Login from './pages/Login';
// import Profile from './pages/Profile';

// import Signup from './pages/Signup';
// import AdminShop from './pages/AdminShop';
// import AdminCollection from './pages/AdminCollection'; // Ensure the file exists at 'src/pages/AdminCollection.tsx' or adjust the path accordingly