// app/layout.tsx

import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // ✅ Import CartProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider> {/* ✅ Wrap in CartProvider */}
            <Navbar />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
