import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ProductCard, ProductCardProps } from '../features/products/components/ProductCard';
import { QuickViewModal } from "../features/products/components/QuickViewModal";
import { PromoSection, FeaturesSection, InstagramSection, NewsletterSection } from '../components/sections/SharedSections';
import { productApi } from '../features/products/api/productApi';
import { useCategories } from '../features/shop/hooks/useShop';

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

export const Products = () => {

  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('Newest');
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardProps | null>(null);

  const { data: categories } = useCategories();

  // Handle sticky sidebar on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Logic if needed, previously isSidebarSticky
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch API
  const { data: apiProducts, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.findAll
  });

  // Parallax Hero Banner
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityParallax = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Map Backend Data to Frontend UI Structure
  const mappedProducts = (apiProducts || []).map((p, index) => ({
    id: p.id,
    title: p.name,
    brand: p.categoryName,
    category: p.categoryName,
    price: p.price,
    description: p.description,
    imageUrl: TECH_IMAGES[index % TECH_IMAGES.length],
    colors: ['#000', '#FDE047'], // Mock fallback for filters
    sizes: ['M', 'L'] // Mock fallback for filters
  }));

  const PRICE_RANGES = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: '0-50', label: '$0 - $50', min: 0, max: 50 },
    { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
    { id: '100-150', label: '$100 - $150', min: 100, max: 150 },
    { id: '150+', label: '$150+', min: 150, max: Infinity }
  ];

  // Dynamic filtering & sorting
  const baseFilteredProducts = mappedProducts.filter(p => {
    const matchSize = activeSize ? p.sizes?.includes(activeSize) : true;
    const matchColor = activeColor ? p.colors?.includes(activeColor) : true;
    const matchCategory = activeCategory ? p.category === activeCategory : true;

    let matchPrice = true;
    if (activePriceRange && activePriceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === activePriceRange);
      if (range) matchPrice = p.price >= range.min && p.price <= range.max;
    }

    return matchSize && matchColor && matchCategory && matchPrice;
  });

  const filteredProducts = [...baseFilteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return b.id - a.id; // Newest
  });

  return (
    <div className="w-full dark:bg-gray-900 min-h-screen">
      
      {/* 1. Immersive Hero Banner */}
      <section ref={heroRef} className="relative h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center bg-black">
        <motion.div style={{ y: yParallax }} className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60" alt="Tech Catalog" />
        </motion.div>
        <motion.div style={{ opacity: opacityParallax }} className="relative z-10 text-center text-white px-4">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase mb-4 font-bold text-gray-300">Premium Tech</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter uppercase mb-4">Catalog</h1>
          <p className="text-sm text-gray-300 tracking-widest uppercase font-semibold">Home • Products</p>
        </motion.div>
      </section>

      {/* 2. Catalog Section */}
      <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row gap-12">
        
        {/* Left Sidebar (Sticky Filters) */}
        <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-32 h-fit space-y-10 z-10">
          <div>
            <h4 className="font-bold mb-6 uppercase text-sm border-b pb-4 dark:border-gray-800 dark:text-white tracking-[0.2em]">Filters</h4>

            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Category</h5>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  <li
                    onClick={() => setActiveCategory(null)}
                    className={`cursor-pointer transition-colors flex items-center gap-2 ${!activeCategory ? 'font-bold text-black dark:text-white' : 'hover:text-black dark:hover:text-white'}`}
                  >
                    {!activeCategory && <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>}
                    <span>All Categories</span>
                  </li>
                  {categories.map(c => (
                    <li
                      key={c.id}
                      onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
                      className={`cursor-pointer transition-colors flex items-center gap-2 ${activeCategory === c.name ? 'font-bold text-black dark:text-white' : 'hover:text-black dark:hover:text-white'}`}
                    >
                      {activeCategory === c.name && <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>}
                      <span>{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Filter */}
            <div className="mb-8">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Size / Type</h5>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setActiveSize(activeSize === size ? null : size)}
                    className={`w-10 h-10 flex items-center justify-center border rounded-sm text-xs font-bold transition-all ${
                      activeSize === size 
                        ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white shadow-md' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div className="mb-8">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Colors</h5>
              <div className="flex flex-wrap gap-3">
                {['#000', '#FDE047', '#93C5FD', '#FBCFE8', '#86EFAC', '#3B82F6', '#F9A8D4'].map((color, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveColor(activeColor === color ? null : color)}
                    className={`w-8 h-8 rounded-full shadow-sm transition-transform ${activeColor === color ? 'scale-125 ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-gray-900' : 'hover:scale-110'}`} 
                    style={{ backgroundColor: color, border: '1px solid rgba(0,0,0,0.1)' }} 
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              
              <AnimatePresence>
                {(activeSize || activeColor || activeCategory) && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    onClick={() => { setActiveSize(null); setActiveColor(null); setActiveCategory(null); }}
                    className="mt-6 text-xs font-bold text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear Filters
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            {/* Price (Dynamic) */}
            <div className="mb-8">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Price</h5>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                {PRICE_RANGES.map((range) => {
                  const isActive = (activePriceRange || 'all') === range.id;
                  return (
                    <li 
                      key={range.id}
                      onClick={() => setActivePriceRange(range.id)}
                      className={`cursor-pointer transition-colors flex items-center gap-2 ${isActive ? 'font-bold text-black dark:text-white' : 'hover:text-black dark:hover:text-white'}`}
                    >
                      {isActive && <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>}
                      <span>{range.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Right Product Grid (Animated Layout) */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-8 border-b dark:border-gray-800 pb-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
              {isLoading ? (
                <span className="animate-pulse">Loading products...</span>
              ) : isError ? (
                <span className="text-red-500">Failed to load products</span>
              ) : (
                <>Showing <span className="text-black dark:text-white font-bold">{filteredProducts.length}</span> results</>
              )}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Sort by:</span>
                <select 
                  className="border-none bg-transparent font-bold text-sm focus:ring-0 dark:text-white cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="animate-pulse">
                   <div className="bg-gray-200 dark:bg-gray-800 aspect-[3/4] mb-4"></div>
                   <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4 mb-2"></div>
                   <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/2"></div>
                 </div>
               ))}
            </div>
          )}

          {/* Dynamic Framer Motion Grid */}
          {!isLoading && !isError && (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
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
          
          <AnimatePresence>
            {!isLoading && filteredProducts.length === 0 && !isError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="w-full py-32 flex flex-col items-center justify-center text-center"
              >
                <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your size or color filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PromoSection />
      <FeaturesSection />
      <InstagramSection />
      <NewsletterSection />

      {/* Quick View Modal Portal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
