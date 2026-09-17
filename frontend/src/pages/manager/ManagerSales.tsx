import { useState } from 'react';
import { useStock, useSales, useCreateSale } from '../../features/shop/hooks/useShop';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Receipt, CheckCircle2, Search, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerOrdersPanel } from './CustomerOrdersPanel';

type CartItem = {
  stockItemId: number;
  name: string;
  unitPrice: number;
  quantity: number;
};

export const ManagerSales = () => {
  const { data: stockItems, isLoading: isStockLoading } = useStock();
  const { data: sales, isLoading: isSalesLoading } = useSales();
  const { mutate: createSale, isPending: isCreating } = useCreateSale();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'pos' | 'orders'>('pos');

  const onlineOrdersCount = (sales ?? []).filter(s => s.source === 'ONLINE').length;

  const addToCart = (item: any) => {
    if (item.quantity <= 0) return toast.error("Out of stock!");
    
    setCart((prev) => {
      const existing = prev.find(i => i.stockItemId === item.id);
      if (existing) {
        if (existing.quantity >= item.quantity) {
          toast.error("Not enough stock available");
          return prev;
        }
        return prev.map(i => i.stockItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { stockItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.stockItemId !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    createSale(
      { items: cart.map(i => ({ stockItemId: i.stockItemId, quantity: i.quantity })) },
      {
        onSuccess: () => {
          toast.success("Sale completed successfully!");
          setCart([]);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || "Error processing sale");
        }
      }
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const filteredItems = stockItems?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isStockLoading || isSalesLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-100 dark:border-white/10 rounded-full"></div>
          <div className="absolute w-16 h-16 border-4 border-black dark:border-white rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:h-[calc(100vh-6rem)] flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
            {tab === 'pos' ? 'Point of Sale' : 'Commandes clients'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-sm sm:text-base">
            {tab === 'pos' ? 'Quickly process in-store transactions.' : 'Commandes passées en ligne sur votre boutique.'}
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-white/5 rounded-full p-1 self-start sm:self-auto">
          <button
            onClick={() => setTab('pos')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${tab === 'pos' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500'}`}
          >
            <ShoppingCart size={16} /> Caisse
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${tab === 'orders' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500'}`}
          >
            <Users size={16} /> <span className="hidden xs:inline">Commandes clients</span><span className="xs:hidden">Commandes</span>
            {onlineOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{onlineOrdersCount}</span>
            )}
          </button>
        </div>
      </div>

      {tab === 'orders' ? (
        <CustomerOrdersPanel />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:min-h-0">

        {/* POS Products Grid */}
        <div className="lg:col-span-8 flex flex-col space-y-6 min-h-0">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Scan barcode or search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.01)] transition-all dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems?.map(item => {
                const inCart = cart.find(c => c.stockItemId === item.id)?.quantity || 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={item.quantity === 0}
                    className={`relative flex flex-col items-start justify-between p-5 border rounded-2xl transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed min-h-[140px] group ${
                      inCart > 0 
                        ? 'border-black dark:border-white bg-gray-50/50 dark:bg-white/5 shadow-md scale-[0.98]' 
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-[#111111]'
                    }`}
                  >
                    {inCart > 0 && (
                      <span className="absolute top-3 right-3 bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-md">
                        {inCart}
                      </span>
                    )}
                    <div className="w-full">
                      <span className={`text-[10px] uppercase font-bold tracking-wider mb-2 block ${item.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.quantity} in stock
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white mt-4 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-lg">
                      ${item.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart & History Column */}
        <div className="lg:col-span-4 flex flex-col space-y-6 min-h-0">
          
          {/* Cart Panel */}
          <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-gray-900 dark:text-white" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Order</h2>
              </div>
              <span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-full text-xs font-bold">
                {cart.length} items
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Receipt size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">Cart is empty</p>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      key={item.stockItemId} 
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">${item.unitPrice.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-gray-900 dark:text-white">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.stockItemId)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#111111] text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm">
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm">Total Amount</span>
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCreating}
                className="w-full relative overflow-hidden bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex justify-center items-center gap-2"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={20} /> Charge ${cartTotal.toFixed(2)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
