import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { useMyOrders } from '../features/shop/hooks/useShop';
import type { SaleItemStatus } from '../features/shop/types';
import { groupSalesByOrder } from '../features/shop/utils/groupOrders';

const STATUS_LABELS: Record<SaleItemStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  EXPIRED: 'Expirée',
};

const STATUS_STYLES: Record<SaleItemStatus, string> = {
  PENDING: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10',
  CONFIRMED: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  PREPARING: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
  SHIPPED: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  DELIVERED: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
  CANCELLED: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
  EXPIRED: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800',
};

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'details'>('orders');
  const { logout, user } = useAuthStore();
  const { data: sales, isLoading: isOrdersLoading } = useMyOrders();
  const orders = sales ? groupSalesByOrder(sales) : [];

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
                  {isOrdersLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 border-4 border-gray-100 dark:border-gray-800 border-t-black dark:border-t-white rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">Vous n'avez pas encore passé de commande.</p>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {orders.map(order => (
                        <div key={order.key} className="border border-gray-100 dark:border-gray-800 rounded-sm overflow-hidden">
                          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">{order.orderReference}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {' à '}
                                {new Date(order.createdDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between items-center px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.stockItemName}</p>
                                  <p className="text-xs text-gray-500">
                                    Qté {item.quantity} · ${item.unitPrice.toFixed(2)}
                                    {item.shopName && <> · {item.shopName}</>}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase border ${STATUS_STYLES[item.status]}`}>
                                  {STATUS_LABELS[item.status]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
