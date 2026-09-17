import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'details'>('orders');
  const { logout, user } = useAuthStore();

  return (
    <div className="w-full bg-white dark:bg-gray-900 font-sans min-h-[75vh]">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-12 text-center md:text-left">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
             <div className="flex flex-col gap-2">
               <button 
                 onClick={() => setActiveTab('orders')} 
                 className={`text-left px-6 py-4 rounded-sm font-semibold transition-colors text-sm uppercase tracking-widest ${activeTab === 'orders' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-l-4 border-black dark:border-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'}`}
               >
                 My Orders
               </button>
               <button 
                 onClick={() => setActiveTab('details')} 
                 className={`text-left px-6 py-4 rounded-sm font-semibold transition-colors text-sm uppercase tracking-widest ${activeTab === 'details' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-l-4 border-black dark:border-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'}`}
               >
                 Account Details
               </button>
               <button 
                 onClick={logout} 
                 className="text-left px-6 py-4 rounded-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 mt-4 text-sm uppercase tracking-widest border-l-4 border-transparent"
               >
                 Logout
               </button>
             </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-3/4">
             
             {activeTab === 'orders' && (
               <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Order History</h2>
                  {/* Assuming no orders right now, or mock some */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b-2 border-gray-100 dark:border-gray-800">
                          <th className="pb-4 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Order ID</th>
                          <th className="pb-4 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Date</th>
                          <th className="pb-4 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Status</th>
                          <th className="pb-4 font-bold text-gray-900 dark:text-white text-right text-sm uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2].map(i => (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-6 font-semibold text-gray-900 dark:text-gray-300 text-sm">#KSHOP-892{i}</td>
                            <td className="py-6 text-gray-500 text-sm">Oct {24 + i}, 2026</td>
                            <td className="py-6">
                              <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 px-3 py-1 rounded-sm text-xs font-bold uppercase">
                                Delivered
                              </span>
                            </td>
                            <td className="py-6 font-bold text-right text-gray-900 dark:text-white">${(120.00 * i).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             )}

             {activeTab === 'details' && (
               <div className="max-w-2xl">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-8">Account Details</h2>
                  
                  <div className="flex flex-col gap-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input type="text" placeholder="First Name" defaultValue={user?.firstname || ''} className="p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                      <input type="text" placeholder="Last Name" defaultValue={user?.lastname || ''} className="p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                    </div>
                    <input type="email" placeholder="Email Address" defaultValue={user?.email || ''} className="p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white w-full" />
                    
                    <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-2">Password Change</h3>
                    <input type="password" placeholder="Current Password" className="p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white w-full" />
                    <input type="password" placeholder="New Password" className="p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white w-full" />
                    <input type="password" placeholder="Confirm New Password" className="p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white w-full" />
                  </div>
                  
                  <Button variant="primary" className="bg-black text-white px-12 py-4 rounded-md shadow-xl text-xs font-bold uppercase tracking-widest">
                    Save Changes
                  </Button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
