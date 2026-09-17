import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const OrderSuccess = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-900 font-sans">
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        
        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-100 dark:border-green-800">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6">Thank You For Your Order!</h1>
        
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed text-sm">
          Your order <span className="font-bold text-black dark:text-white">#KSHOP-8923</span> has been successfully placed. We've sent a confirmation email with your order details to your inbox.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/profile">
            <Button variant="outline" className="w-full sm:w-auto px-10 py-4 rounded-md border-2 border-black dark:border-white text-black dark:text-white font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
              View Order
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="primary" className="w-full sm:w-auto px-10 py-4 rounded-md bg-black text-white shadow-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800">
              Continue Shopping
            </Button>
          </Link>
        </div>
        
      </div>
    </div>
  );
};
