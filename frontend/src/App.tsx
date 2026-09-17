import { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NotFoundPage } from './components/NotFoundPage';
import { HomeNavbar } from './components/layout/HomeNavbar';
import { ShopNavbar } from './components/layout/ShopNavbar';
import { useThemeStore } from './store/themeStore';

import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Favorites } from './pages/Favorites';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Profile } from './pages/Profile';
import { Footer } from './components/layout/Footer';
import { MiniCart } from './components/cart/MiniCart';
import { AuthModal } from './components/auth/AuthModal';

import { ManagerLayout } from './components/layout/ManagerLayout';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ManagerStock } from './pages/manager/ManagerStock';
import { ManagerSales } from './pages/manager/ManagerSales';
import { ManagerSettings } from './pages/manager/ManagerSettings';

import { AdminLayout } from './components/layout/AdminLayout';
import { AdminShops } from './pages/admin/AdminShops';
import { AdminManagers } from './pages/admin/AdminManagers';
import { AdminClients } from './pages/admin/AdminClients';

// Layout pour la page d'accueil
const HomeLayout = () => (
  <div className="flex flex-col min-h-screen">
    <HomeNavbar />
    <Outlet />
    <Footer />
  </div>
);

// Layout pour la boutique et les autres pages
const ShopLayout = () => (
  <div className="flex flex-col min-h-screen">
    <ShopNavbar />
    <Outlet />
    <Footer />
  </div>
);

function App() {
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);


  // Framer Motion variants for page transition
  const pageVariants = {
    initial: { opacity: 0, y: 15, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -15, filter: "blur(4px)", transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
      <MiniCart />
      <AuthModal />
      <Toaster position="top-right" 
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white'
        }}
      />

      <AnimatePresence 
        mode="wait" 
        onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
      >
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="flex flex-col min-h-screen"
        >
          <Routes location={location}>
            {/* Espace Admin (Protégé) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="shops" element={<AdminShops />} />
                <Route path="managers" element={<AdminManagers />} />
                <Route path="clients" element={<AdminClients />} />
              </Route>
            </Route>

            {/* Espace Gérante (Protégé) */}
            <Route element={<ProtectedRoute allowedRoles={['SHOP_MANAGER', 'ADMIN']} />}>
              <Route path="/manager" element={<ManagerLayout />}>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="stock" element={<ManagerStock />} />
                <Route path="sales" element={<ManagerSales />} />
                <Route path="settings" element={<ManagerSettings />} />
              </Route>
            </Route>

            {/* Layout Accueil */}
            <Route element={<HomeLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* Layout Boutique / Global */}
            <Route element={<ShopLayout />}>
              <Route path="/products" element={<Products />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/success" element={<OrderSuccess />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
