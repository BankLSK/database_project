'use client';

import { Home } from './pages/Home/Home';
import { AdminOverview } from './pages/AdminOverview/AdminOverview';
import { useAuth } from '@/app/context/AuthContext';

export default function Page() {
  const { userType } = useAuth();

  if (!userType) {
    return <div>Loading...</div>; // Optional: can show spinner or splash screen
  }

  return (
    <div>
      {userType === 'admin' ? <AdminOverview /> : <Home />}
    </div>
  );
}
