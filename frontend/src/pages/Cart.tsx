import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/Button';
import { NewsletterSection } from '../components/sections/SharedSections';

export const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotal } = useCartStore();
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);

  const subtotal = getTotal() + (isGiftWrapped ? 10 : 0);

  return (
    <div className="w-full font-sans bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">Shopping Cart</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Home • Your Shopping Cart</p>
        </div>

        {/* Cart Content */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-6">Your cart is empty.</p>
            <Link to="/products">
              <Button variant="primary" className="px-8 bg-black text-white rounded-none">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            
            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-100 dark:border-gray-800">
                    <th className="pb-4 font-serif font-bold text-gray-900 dark:text-white w-1/2">Product</th>
                    <th className="pb-4 font-serif font-bold text-gray-900 dark:text-white">Price</th>
                    <th className="pb-4 font-serif font-bold text-gray-900 dark:text-white">Quantity</th>
                    <th className="pb-4 font-serif font-bold text-gray-900 dark:text-white text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.productId}-${item.variant}`} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-6">
                        <div className="flex gap-6 items-center">
                          <img src={item.imageUrl} alt={item.name} className="w-24 h-32 object-cover bg-gray-100 dark:bg-gray-800 rounded-sm" />
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                            {item.variant && <p className="text-sm text-gray-500 mb-2">{item.variant}</p>}
                            <button onClick={() => removeFromCart(item.productId, item.variant)} className="text-sm text-gray-400 hover:text-red-500 underline decoration-1 underline-offset-2">Remove</button>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 font-bold text-gray-900 dark:text-white">${(item.price || 0).toFixed(2)}</td>
                      <td className="py-6">
                        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-24 rounded-sm">
                          <button onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">-</button>
                          <span className="w-8 text-center text-sm font-bold">{String(item.quantity).padStart(2, '0')}</span>
                          <button onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">+</button>
                        </div>
                      </td>
                      <td className="py-6 font-bold text-gray-900 dark:text-white text-right">${((item.price || 0) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cart Summary */}
            <div className="flex flex-col items-end">
              <div className="w-full md:w-96 flex flex-col gap-6">
                <label className="flex items-center gap-3 cursor-pointer group pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-sm group-hover:border-black dark:group-hover:border-white transition-colors">
                     <input type="checkbox" checked={isGiftWrapped} onChange={(e) => setIsGiftWrapped(e.target.checked)} className="opacity-0 absolute inset-0 cursor-pointer" />
                     {isGiftWrapped && <svg className="w-3 h-3 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">For <span className="font-bold text-black dark:text-white">$10.00</span> Please Wrap The Product</span>
                </label>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900 dark:text-white">Subtotal</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                
                <Link to="/checkout" className="w-full">
                  <Button variant="primary" className="w-full h-14 bg-black text-white rounded-md shadow-xl uppercase tracking-widest text-xs">Checkout</Button>
                </Link>
                <div className="text-center">
                  <Link to="/cart" className="text-sm font-bold text-gray-900 dark:text-white underline underline-offset-4 decoration-2 hover:text-gray-500">View Cart</Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <NewsletterSection />
    </div>
  );
};
