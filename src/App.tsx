import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Collection from './pages/Collection';
import BestSeller from './pages/BestSeller';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminOverview from './pages/AdminOverview';
import Signup from './pages/Signup';
import AdminShop from './pages/AdminShop';
import AdminCollection from './pages/AdminCollection';


// Admin versions (you can create simple placeholders for now)


import { useAuth } from './contexts/AuthContext';

function App() {
  const { role } = useAuth();

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={role === 'admin' ? <AdminOverview /> : <Home />} />
        <Route
          path="/collection"
          element={role === 'admin' ? <AdminCollection /> : <Collection />}
        />
        <Route path="/best-seller" element={<BestSeller />} />
        <Route path="/shop" element={role === 'admin' ? <AdminShop /> : <Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;
