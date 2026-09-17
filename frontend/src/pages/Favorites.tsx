import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ProductCard, ProductCardProps } from '../features/products/components/ProductCard';
import { QuickViewModal } from '../features/products/components/QuickViewModal';
import { Button } from '../components/ui/Button';
import { useFavoritesStore } from '../store/favoritesStore';
import { productApi } from '../features/products/api/productApi';
import { useState } from 'react';

export const Favorites = () => {
  const favoriteIds = useFavoritesStore(state => state.favoriteIds);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardProps | null>(null);

  // Fetch all products (could be optimized, but ok for now)
  const { data: apiProducts, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.findAll()
  });

  const TECH_IMAGES = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80',
    'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=1200&q=80',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80',
    'https://images.unsplash.com/photo-1494173853739-c21f58b16055?w=1200&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&q=80',
];

  const mappedProducts = (apiProducts || []).map((p, index) => ({
    id: p.id,
    title: p.name,
    brand: p.categoryName || 'Tech',
    price: p.price,
    imageUrl: TECH_IMAGES[index % TECH_IMAGES.length],
    description: p.description
  }));

  const favoriteProducts = mappedProducts.filter(p => favoriteIds.includes(Number(p.id)));

  return (
    <div className="w-full dark:bg-gray-900 min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Your Wishlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-semibold">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 aspect-[3/4] mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-500 font-medium">Failed to load favorites. Please try again.</div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && favoriteProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">It's empty here</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">You haven't saved any items to your wishlist yet. Start shopping and add your favorite items!</p>
            <Link to="/products">
              <Button variant="primary" className="uppercase text-xs tracking-widest px-10 py-4 shadow-xl hover:scale-105 transition-transform bg-black text-white dark:bg-white dark:text-black">
                Discover Products
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !isError && favoriteProducts.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {favoriteProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <ProductCard 
                    {...product} 
                    onQuickView={() => setQuickViewProduct(product)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
