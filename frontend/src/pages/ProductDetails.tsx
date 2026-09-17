import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PromoSection, DealsSection, NewsletterSection } from '../components/sections/SharedSections';
import { useCartStore } from '../store/cartStore';
import { productApi } from '../features/products/api/productApi';

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

// -- COMPOSANT MAGNÉTIC ZOOM --
const ImageZoom = ({ src }: { src: string }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };
  
  return (
    <div 
      className="w-full aspect-[3/4] md:aspect-auto md:h-[90vh] bg-gray-100 dark:bg-gray-800 overflow-hidden relative cursor-crosshair rounded-sm shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`} alt="Product View" />
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
          backgroundSize: '200%', // Niveau de zoom
          opacity: isHovered ? 1 : 0
        }}
      />
    </div>
  );
};

// -- COMPOSANT ACCORDÉON --
const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 py-5">
       <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center font-bold text-xs text-gray-900 dark:text-white uppercase tracking-[0.2em]">
         {title}
         <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-lg leading-none">+</motion.span>
       </button>
       <AnimatePresence>
         {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {children}
              </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  )
}

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '1', 10);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.findById(productId),
  });

  const [selectedSize, setSize] = useState('M');
  const [selectedColor, setColor] = useState('#000000');
  const [quantity, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const addToCart = useCartStore(state => state.addToCart);
  const openCart = useCartStore(state => state.openCart);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white rounded-full animate-spin"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Loading Product...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 text-center px-4">
        <h1 className="text-4xl font-serif font-black mb-4 dark:text-white">Product Not Found</h1>
        <p className="text-gray-500 mb-8">This product doesn't exist or has been removed.</p>
        <Link to="/products" className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform">Back to Catalog</Link>
      </div>
    );
  }

  const mainImage = TECH_IMAGES[product.id % TECH_IMAGES.length];
  const images = [
    mainImage,
    TECH_IMAGES[(product.id + 1) % TECH_IMAGES.length],
    TECH_IMAGES[(product.id + 2) % TECH_IMAGES.length],
  ];

  const handleAddToCart = () => {
    if (quantity > product.availableQuantity) {
      alert(`Sorry, only ${product.availableQuantity} items available in stock.`);
      return;
    }

    setIsAdded(true);
    addToCart({ 
      productId: product.id, 
      name: product.name, 
      price: product.price, 
      quantity, 
      imageUrl: mainImage, 
      variant: `${selectedSize} / ${selectedColor}` 
    });
    
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 1500);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 font-sans relative">
      
      {/* Product Top Section (Stacked Gallery + Sticky Right Panel) */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-12 py-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
         
         {/* LEFT COLUMN: Stacked Image Gallery */}
         <div className="lg:w-[60%] flex flex-col gap-4">
            {images.map((img, i) => (
              <ImageZoom key={i} src={img} />
            ))}
         </div>

         {/* RIGHT COLUMN: Sticky Info */}
         <div className="lg:w-[40%] relative">
            <div className="sticky top-24 pt-4 pb-24">
              
              <div className="mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">{product.categoryName}</p>
                <h1 className="text-4xl lg:text-5xl font-serif font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">${(product.price || 0).toFixed(2)}</span>
                  {product.availableQuantity < 20 && (
                    <span className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Only {product.availableQuantity} left</span>
                  )}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mb-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                 <p className="font-bold text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-widest flex justify-between">
                   <span>Color</span>
                   <span className="text-gray-400">{selectedColor === '#000000' ? 'Midnight Black' : selectedColor === '#3B82F6' ? 'Ocean Blue' : 'Rose Red'}</span>
                 </p>
                 <div className="flex gap-4">
                   {['#000000', '#3B82F6', '#F43F5E'].map(c => (
                     <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-black dark:ring-white ring-offset-4 dark:ring-offset-gray-900' : 'hover:scale-110'}`} style={{ backgroundColor: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                   ))}
                 </div>
              </div>

              {/* Size Selector */}
              <div className="mb-10">
                 <p className="font-bold text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-widest flex justify-between">
                   <span>Size / Specification</span>
                 </p>
                 <div className="grid grid-cols-4 gap-3">
                   {['S', 'M', 'L', 'XL'].map(s => (
                     <button key={s} onClick={() => setSize(s)} className={`h-12 flex items-center justify-center border text-sm font-bold transition-all ${selectedSize === s ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-md' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white'}`}>
                       {s}
                     </button>
                   ))}
                 </div>
              </div>

              {/* Add to Cart Group (Desktop) */}
              <div className="hidden lg:flex flex-col gap-4 mb-12">
                 <div className="flex gap-4">
                   {/* Quantity */}
                   <div className="flex items-center border border-gray-200 dark:border-gray-700 h-14 w-32 shrink-0">
                     <button onClick={() => setQty(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">-</button>
                     <span className="flex-1 text-center font-bold text-lg dark:text-white">{quantity}</span>
                     <button onClick={() => setQty(Math.min(product.availableQuantity, quantity + 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">+</button>
                   </div>
                   
                   {/* Animated Button */}
                   <div className="flex-1">
                     <AnimatePresence mode="wait">
                       {!isAdded ? (
                         <motion.button 
                           key="add"
                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                           onClick={handleAddToCart} 
                           disabled={product.availableQuantity === 0}
                           className={`w-full h-14 font-bold uppercase tracking-[0.2em] text-sm shadow-xl transition-colors ${
                             product.availableQuantity === 0 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                           }`}
                         >
                           {product.availableQuantity === 0 ? 'Out of Stock' : 'Add to cart'}
                         </motion.button>
                       ) : (
                         <motion.button 
                           key="success"
                           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -10 }}
                           className="w-full h-14 bg-green-500 text-white font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 shadow-xl"
                         >
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                           Added!
                         </motion.button>
                       )}
                     </AnimatePresence>
                   </div>
                 </div>
              </div>

              {/* Accordions */}
              <div className="mb-8">
                 <Accordion title="Description" defaultOpen={true}>
                   {product.description || "Experience the perfect blend of premium quality and modern design. This piece is crafted to elevate your daily routine."}
                 </Accordion>
                 <Accordion title="Category Details">
                   <p className="mb-2"><strong>{product.categoryName}</strong></p>
                   <p className="text-gray-500">{product.categoryDescription}</p>
                 </Accordion>
                 <Accordion title="Shipping & Returns">
                   <p className="mb-2"><strong>Free standard shipping</strong> on orders over $200.</p>
                   <p>You have 30 days to return your item for a full refund. Items must be in original condition with tags attached.</p>
                 </Accordion>
              </div>

              {/* Trust Badges */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-sm text-center">
                 <p className="text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-widest mb-4">100% Secure Checkout</p>
                 <div className="flex justify-center gap-4 grayscale opacity-60">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" className="h-4 object-contain" alt="Visa" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" className="h-4 object-contain" alt="Mastercard" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" className="h-4 object-contain" alt="PayPal" />
                 </div>
              </div>

            </div>
         </div>
      </section>

      {/* Floating Action Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 z-50 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
         <div className="flex flex-col">
           <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Total</span>
           <span className="text-xl font-bold text-gray-900 dark:text-white">${(product.price || 0).toFixed(2)}</span>
         </div>
         <div className="w-[60%]">
           <AnimatePresence mode="wait">
             {!isAdded ? (
               <motion.button 
                 key="add" 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                 onClick={handleAddToCart}
                 disabled={product.availableQuantity === 0} 
                 className={`w-full h-12 font-bold uppercase tracking-widest text-xs shadow-xl ${product.availableQuantity === 0 ? 'bg-gray-300 text-gray-500' : 'bg-black dark:bg-white text-white dark:text-black'}`}
               >
                 {product.availableQuantity === 0 ? 'Out of Stock' : 'Add to cart'}
               </motion.button>
             ) : (
               <motion.button key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-12 bg-green-500 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Added
               </motion.button>
             )}
           </AnimatePresence>
         </div>
      </div>

      {/* Shared Sections */}
      <PromoSection />
      <DealsSection title="Complete The Look" /> 
      <NewsletterSection />
    </div>
  );
};
