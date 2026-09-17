import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const links = [
    { to: '/admin/shops', label: 'Boutiques', icon: '🏪' },
    { to: '/admin/managers', label: 'Gérantes', icon: '👤' },
    { to: '/admin/clients', label: 'Clients', icon: '🛍️' },
  ];

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold">KSHOP Admin</h2>
        <button
          onClick={() => setIsMobileNavOpen(false)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                <span className="font-medium text-sm">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium">{user?.firstname} {user?.lastname}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">ADMIN</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex justify-center items-center py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={logout}
            className="flex-1 flex justify-center items-center py-2 rounded-lg bg-red-900/50 text-red-400 hover:bg-red-900/80 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
      {/* Sidebar — fixe sur desktop, tiroir hors-écran sur mobile */}
      <aside className="hidden md:flex w-64 bg-gray-900 dark:bg-black text-white border-r border-gray-800 flex-col transition-colors duration-200">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-64 max-w-[85vw] h-full bg-gray-900 dark:bg-black text-white flex flex-col shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-sm font-serif font-bold">KSHOP Admin</h2>
        </div>
        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
