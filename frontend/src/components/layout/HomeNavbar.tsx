import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, User, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthModalStore } from '../../store/authModalStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const HomeNavbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { items, openCart } = useCartStore();
  const openModal = useAuthModalStore(state => state.openModal);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [bumpCart, setBumpCart] = useState(false);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const favCount = useFavoritesStore(state => state.favoriteIds.length);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart bump animation effect
  useEffect(() => {
    if (cartCount > 0) {
      setBumpCart(true);
      const timer = setTimeout(() => setBumpCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Helper for active link styles with animated underline
  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `relative pb-1 text-sm transition-colors hover:text-black dark:hover:text-white ${
      active ? 'text-black dark:text-white font-bold' : 'text-gray-600 dark:text-gray-300 font-medium'
    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black dark:after:bg-white after:origin-center after:transition-transform after:duration-300 ${
      active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
    }`;
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="text-3xl font-serif font-black tracking-widest text-gray-900 dark:text-white">
            KSHOP
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/products" className={linkClass('/products')}>Shop</Link>
            <Link to="/products" className={linkClass('/collections')}>Products</Link>
            
            {/* Dropdown Menu for Pages */}
            <div className="relative group">
              <button className="relative pb-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
                Pages <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-md py-2 w-40 flex flex-col">
                  <Link to="/" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 font-medium">About Us</Link>
                  <Link to="/" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 font-medium">Contact</Link>
                  <Link to="/" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 font-medium">FAQ</Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Actions Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            
            <button 
              onClick={() => navigate("/favorites")}
              className="relative text-gray-900 dark:text-white hover:text-red-500 transition-colors p-2 cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {favCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-full">
                  {favCount}
                </span>
              )}
            </button>

            <button 
              onClick={openCart} 
              className="relative text-gray-900 dark:text-white hover:text-gray-500 transition-colors p-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span className={`absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full transition-transform duration-300 ${bumpCart ? 'scale-125' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'ADMIN' && (
                  <button onClick={() => navigate('/admin/shops')} className="text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-1.5 rounded-md hidden sm:block">
                    Espace Admin
                  </button>
                )}
                {user?.role === 'SHOP_MANAGER' && (
                  <button onClick={() => navigate('/manager/dashboard')} className="text-sm font-bold bg-blue-600 text-white px-3 py-1.5 rounded-md hidden sm:block">
                    Espace Gérante
                  </button>
                )}
                <button onClick={() => navigate('/profile')} className="text-gray-900 dark:text-white hover:text-gray-500 transition-colors p-2 cursor-pointer hidden sm:block">
                  <User className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => openModal('signup')} className="hidden sm:block">
                <Button variant="primary" className="rounded-md shadow-lg shadow-black/10 px-6 cursor-pointer">Sign Up</Button>
              </button>
            )}

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-500 hover:rotate-180"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-gray-900 dark:text-white hover:text-gray-500 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 md:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col p-6`}>
           <div className="flex justify-between items-center mb-10">
             <span className="text-2xl font-serif font-black tracking-widest text-gray-900 dark:text-white">KSHOP</span>
             <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
               <X className="w-6 h-6" />
             </button>
           </div>
           
           <nav className="flex flex-col gap-6">
             <Link to="/" onClick={() => setIsMobileOpen(false)} className={`text-lg font-medium ${location.pathname === '/' ? 'font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>Home</Link>
             <Link to="/products" onClick={() => setIsMobileOpen(false)} className={`text-lg font-medium ${location.pathname === '/products' ? 'font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>Shop</Link>
             <Link to="/products" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-gray-600 dark:text-gray-300">Products</Link>
             <Link to="/" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-gray-600 dark:text-gray-300">Pages</Link>
           </nav>

           <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
             {isAuthenticated ? (
                <button onClick={() => { setIsMobileOpen(false); navigate('/profile'); }} className="flex items-center gap-3 w-full p-3 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                  <User className="w-5 h-5" /> My Profile
                </button>
             ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={() => { setIsMobileOpen(false); openModal('signin'); }} className="w-full justify-center">Sign In</Button>
                  <Button variant="primary" onClick={() => { setIsMobileOpen(false); openModal('signup'); }} className="w-full justify-center bg-black text-white">Sign Up</Button>
                </div>
             )}
           </div>
        </div>
      </div>
    </>
  );
};
