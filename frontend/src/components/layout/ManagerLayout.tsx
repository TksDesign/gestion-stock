import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { LayoutDashboard, Package, CreditCard, Store, Moon, Sun, LogOut, Hexagon, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ManagerLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const links = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/stock', label: 'Stock Management', icon: Package },
    { to: '/manager/sales', label: 'Sales & POS', icon: CreditCard },
    { to: '/manager/settings', label: 'Store Settings', icon: Store },
  ];

  const sidebarContent = (
    <>
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg">
          <Hexagon size={24} className="fill-current" />
        </div>
        <h2 className="text-xl font-serif font-black tracking-widest text-gray-900 dark:text-white uppercase">KSHOP</h2>
        <button
          onClick={() => setIsMobileNavOpen(false)}
          className="ml-auto md:hidden p-2 text-gray-400 hover:text-black dark:hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
        <div className="mb-4 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase px-4">Menu</div>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-100'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5 hover:scale-[1.02]'
                  }`
                }
              >
                <link.icon size={18} strokeWidth={2.5} className="mr-3 transition-transform group-hover:scale-110" />
                <span className="font-semibold text-sm tracking-wide">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-2xl bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center justify-center text-white dark:text-black font-bold text-sm shadow-inner">
               {user?.firstname?.[0]}{user?.lastname?.[0]}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.firstname} {user?.lastname}</p>
               <p className="text-[10px] uppercase tracking-wider text-gray-500 truncate font-semibold">Manager</p>
             </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex justify-center items-center py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200/50 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:shadow-sm transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
            </button>
            <button
              onClick={logout}
              className="flex-1 flex justify-center items-center py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white transition-all group"
              title="Log out"
            >
              <LogOut size={16} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] overflow-hidden font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Sidebar — fixe sur desktop, tiroir hors-écran sur mobile */}
      <aside className="hidden md:flex w-[280px] bg-white/80 dark:bg-black/50 backdrop-blur-2xl border-r border-gray-200/50 dark:border-white/5 flex-col transition-colors duration-300 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
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
              className="relative w-[280px] max-w-[85vw] h-full bg-white dark:bg-[#0A0A0A] flex flex-col shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area with elegant fade-in */}
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100/50 dark:to-white/5 pointer-events-none" />
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-4 bg-white/90 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
            <Hexagon size={16} className="fill-current" />
          </div>
          <h2 className="text-sm font-serif font-black tracking-widest text-gray-900 dark:text-white uppercase">KSHOP</h2>
        </div>
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
