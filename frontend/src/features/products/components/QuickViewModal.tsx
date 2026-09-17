import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ProductCardProps } from './ProductCard';
import { useCartStore } from '../../../store/cartStore';
import { Button } from '../../../components/ui/Button';

export const QuickViewModal = ({ product, onClose }: { product: ProductCardProps, onClose: () => void }) => {
  const addToCart = useCartStore(state => state.addToCart);
  const openCart = useCartStore(state => state.openCart);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCart = () => {
    addToCart({ 
      productId: Number(product.id), 
      name: product.title, 
      price: product.price, 
      quantity: 1, 
      imageUrl: product.imageUrl, 
      variant: 'Default' 
    });
    onClose();
    openCart();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-4xl flex flex-col md:flex-row relative z-10 shadow-2xl rounded-xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-black hover:text-white transition-colors shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800">
          <img src={product.imageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
          {product.colors && product.colors.length > 0 && (
             <div className="absolute bottom-6 left-6 flex gap-2 p-2 bg-white/90 backdrop-blur-md rounded-full">
               {product.colors.map(c => <div key={c} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />)}
             </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center relative">
          <p className="text-xs text-gray-500 tracking-[0.2em] uppercase mb-2 font-bold">{product.brand}</p>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-gray-900 dark:text-white mb-3">{product.title}</h2>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">${(product.price || 0).toFixed(2)}</p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Experience the perfect blend of premium quality and modern design. This piece is crafted to elevate your daily routine.
          </p>

          <Button 
            variant="primary" 
            onClick={handleAddToCart}
            className="w-full py-4 uppercase text-xs tracking-widest font-bold shadow-xl hover:scale-[1.02] transition-transform"
          >
            Add to Cart
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
