import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export const MiniCart = () => {
  const { isOpen, closeCart, items, updateQuantity, removeFromCart, getTotal } = useCartStore();
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 150;
  const subtotal = getTotal() + (isGiftWrapped ? 10 : 0);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="fixed inset-0 z-[100] font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-black dark:hover:text-white p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Free Shipping Banner */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-center text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
          {amountToFreeShipping > 0 ? (
            <>Buy <span className="font-bold text-black dark:text-white">${amountToFreeShipping.toFixed(2)}</span> More And Get <span className="font-bold text-black dark:text-white">Free Shipping</span></>
          ) : (
            <>Congratulations! You got <span className="font-bold text-black dark:text-white">Free Shipping</span></>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">Your cart is empty.</div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                        {item.variant && <p className="text-xs text-gray-500 mt-1">{item.variant}</p>}
                      </div>
                      <button onClick={() => removeFromCart(item.productId, item.variant)} className="text-gray-400 hover:text-red-500">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">${(item.price || 0).toFixed(2)}</span>
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded">
                        <button onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">-</button>
                        <span className="w-8 text-center text-xs font-bold">{String(item.quantity).padStart(2, '0')}</span>
                        <button onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <label className="flex items-center gap-3 mb-6 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-sm group-hover:border-black dark:group-hover:border-white transition-colors">
                 <input type="checkbox" checked={isGiftWrapped} onChange={(e) => setIsGiftWrapped(e.target.checked)} className="opacity-0 absolute inset-0 cursor-pointer" />
                 {isGiftWrapped && <svg className="w-3 h-3 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">For <span className="font-bold text-black dark:text-white">$10.00</span> Please Wrap The Product</span>
            </label>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-900 dark:text-white">Subtotal</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            
            <Link to="/checkout" onClick={closeCart}>
              <Button variant="primary" className="w-full h-14 bg-black text-white rounded-md mb-4 shadow-xl flex items-center justify-center uppercase tracking-widest text-xs">Checkout</Button>
            </Link>
            <div className="text-center">
              <Link to="/cart" onClick={closeCart} className="text-sm font-bold text-gray-900 dark:text-white underline underline-offset-4 decoration-2 hover:text-gray-500">View Cart</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
