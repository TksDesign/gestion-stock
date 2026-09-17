import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useFavoritesStore } from '../../../store/favoritesStore';

export interface ProductCardProps {
  id: number;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  colors?: string[]; // hex codes
  onQuickView?: () => void;
}

export const ProductCard = ({ id, title, brand, price, imageUrl, colors = [], onQuickView }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);
  const openCart = useCartStore(state => state.openCart);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFav = useFavoritesStore(state => state.favoriteIds.includes(id));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    addToCart({ 
      productId: Number(id), 
      name: title, 
      price: price, 
      quantity: 1, 
      imageUrl: imageUrl, 
      variant: 'Default' 
    });
    openCart();
  };

  return (
    <Link 
      to={`/product/${id}`} 
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-sm mb-4">
        
        {/* Main Image with Slow Luxury Zoom */}
        <motion.img 
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          src={imageUrl} 
          alt={title} 
          className="object-cover w-full h-full" 
        />
        
        {/* Darkening Overlay for contrast */}
        <motion.div 
          animate={{ opacity: isHovered ? 0.2 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black pointer-events-none"
        />

        {/* Top Right Wishlist Icon */}
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: (isHovered || isFav) ? 1 : 0, x: (isHovered || isFav) ? 0 : 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute top-4 right-4 w-9 h-9 bg-white dark:bg-gray-900 text-black dark:text-white rounded-full flex items-center justify-center hover:scale-110 shadow-lg transition-transform"
          onClick={(e) => { e.preventDefault(); toggleFavorite(id); }}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
        </motion.button>

        {/* Bottom Quick Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-4 left-4 right-4 flex gap-2"
        >
          <button 
            onClick={handleQuickAdd} 
            className="flex-1 bg-white dark:bg-gray-900 text-black dark:text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-2xl"
          >
            Quick Add
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onQuickView?.(); }} 
            className="w-12 h-100 bg-white dark:bg-gray-900 text-black dark:text-white flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-2xl"
          >
            <Eye className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase mb-1 transition-colors group-hover:text-gray-500">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{brand}</p>
        </div>
        <p className="font-bold text-gray-900 dark:text-white">${(price || 0).toFixed(2)}</p>
      </div>
      
      {/* Colors */}
      {colors.length > 0 && (
        <div className="flex gap-2 mt-3">
          {colors.map((color, index) => (
            <div 
              key={index} 
              className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </Link>
  );
};
