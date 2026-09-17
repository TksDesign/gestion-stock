import { useDashboard } from '../../features/shop/hooks/useShop';
import { Package, AlertTriangle, Diamond, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const ManagerDashboard = () => {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-100 dark:border-white/10 rounded-full"></div>
          <div className="absolute w-16 h-16 border-4 border-black dark:border-white rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 bg-red-50/50 text-red-600 rounded-3xl dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle size={32} />
          <p className="font-semibold">Unable to load analytics. Please check your connection.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Stock Items', value: dashboard.totalStockItems, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Low Stock Alerts', value: dashboard.lowStockItemsCount, icon: AlertTriangle, color: dashboard.lowStockItemsCount > 0 ? 'text-red-500' : 'text-green-500', bg: dashboard.lowStockItemsCount > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Inventory Value', value: `$${dashboard.totalStockValue.toFixed(2)}`, icon: Diamond, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { label: 'Total Revenue', value: `$${dashboard.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Welcome back, here's what's happening with your store today.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:scale-105 transition-transform shadow-xl shadow-black/10 dark:shadow-white/10">
          Download Report <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, idx) => (
          <motion.div key={idx} variants={itemAnim} className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.01)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent dark:from-white/5 dark:to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Top Selling Items */}
        <div className="xl:col-span-3 bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Performance</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="p-6 flex-1">
            {dashboard.topSellingItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No sales data yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dashboard.topSellingItems.map((item, idx) => {
                  // Calculate percentage for progress bar based on top item
                  const maxRevenue = dashboard.topSellingItems[0].revenue;
                  const percentage = Math.max(10, (item.revenue / maxRevenue) * 100);
                  
                  return (
                    <div key={idx} className="group relative">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className="text-xs font-bold text-gray-400 mr-3">0{idx + 1}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white mr-4">${item.revenue.toFixed(2)}</span>
                          <span className="text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">{item.quantitySold} sold</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                          className="h-full bg-black dark:bg-white rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="xl:col-span-2 bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Alerts</h2>
            <div className="px-3 py-1 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 font-bold text-xs rounded-xl">
              {dashboard.lowStockItems.length} Critical
            </div>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px] custom-scrollbar flex-1">
            {dashboard.lowStockItems.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
                <Package size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-center px-8">All inventory levels are optimal.<br/>No action required.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-white/5">
                {dashboard.lowStockItems.map((item, idx) => {
                  const percentLeft = Math.min(100, Math.max(0, (item.quantity / item.lowStockThreshold) * 100));
                  return (
                  <li key={item.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Threshold: {item.lowStockThreshold}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-red-600 leading-none">{item.quantity}</span>
                      </div>
                    </div>
                    {/* Visual meter */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${percentLeft}%` }} 
                          className="h-full bg-red-500 rounded-full"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-red-500 uppercase">Action Needed</span>
                    </div>
                  </li>
                )})}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
