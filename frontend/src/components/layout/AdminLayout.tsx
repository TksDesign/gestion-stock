import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const links = [
    { to: '/admin/shops', label: 'Boutiques', icon: '🏪' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 dark:bg-black text-white border-r border-gray-800 flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold">KSHOP Admin</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
