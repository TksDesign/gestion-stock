import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ProductCard, ProductCardProps } from '../features/products/components/ProductCard';
import { QuickViewModal } from '../features/products/components/QuickViewModal';
import { DealsSection, PromoSection, FeaturesSection, InstagramSection, TestimonialsSection, NewsletterSection } from '../components/sections/SharedSections';

// -- Données Mockées --
const MOCK_ARRIVALS = [
  { id: 101, title: 'MacBook Pro 16" M3 Max', brand: 'Premium Tech', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400', category: "Laptops" },
  { id: 102, title: 'Sony WH-1000XM5', brand: 'Premium Tech', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400', category: "Laptops" },
  { id: 103, title: 'Custom RGB Mechanical Keyboard', brand: 'Premium Tech', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&q=80&w=400', category: "Audio" },
  { id: 104, title: 'Apple Watch Ultra 2', brand: 'Premium Tech', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400', category: "Laptops" },
  { id: 105, title: 'iPad Pro 12.9" M2', brand: 'Premium Tech', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', category: "Accessories" },
  { id: 106, title: 'Sony Alpha A7 IV', brand: 'Premium Tech', price: 95.0, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400', category: "Audio" },
];

export const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Laptops");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardProps | null>(null);
  const filteredArrivals = activeTab === "Discount Deals" ? MOCK_ARRIVALS : MOCK_ARRIVALS.filter(p => p.category === activeTab);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax calculations
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yCenter = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Staggered Entry Animation variants
  const containerVars = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  const scaleVars = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } }
  };

  const arrivalsRef = useRef(null);
  const { scrollYProgress: arrScroll } = useScroll({
    target: arrivalsRef,
    offset: ["start end", "end start"]
  });

  // Continuous Parallax values for the 3 columns
  const yCol1 = useTransform(arrScroll, [0, 1], [80, -80]);
  const yCol2 = useTransform(arrScroll, [0, 1], [150, -150]);
  const yCol3 = useTransform(arrScroll, [0, 1], [40, -40]);

  return (
    <div className="w-full font-sans dark:bg-gray-900">
      
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative pt-24 pb-8 overflow-hidden">
        {/* Carousel controls on the right (Desktop only) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex-col items-center gap-4 hidden xl:flex z-20">
          <button className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-500 hover:bg-black hover:text-white transition-colors rounded-sm shadow-sm">&lt;</button>
          <span className="text-xs font-bold text-gray-400 rotate-90 my-4 tracking-widest">01</span>
          <button className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-500 hover:bg-black hover:text-white transition-colors rounded-sm shadow-sm">&gt;</button>
        </div>

        <motion.div 
          className="container mx-auto px-4 lg:px-12 flex flex-col lg:flex-row gap-6 h-auto lg:h-[700px] relative z-10"
          variants={containerVars}
          initial="hidden"
          animate="visible"
        >
          
          {/* Left Panel (Tall Image) */}
          <motion.div 
            variants={scaleVars}
            style={{ y: yLeft }}
            className="lg:w-[30%] bg-gray-200 rounded-xl overflow-hidden shadow-lg h-[400px] lg:h-full relative group"
          >
            <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800" alt="Pro Setup" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
          </motion.div>
          
          {/* Center Panel */}
          <div className="lg:w-[40%] flex flex-col gap-6 h-full relative">
            {/* Top Image */}
            <motion.div variants={itemVars} style={{ y: yCenter }} className="h-[25%] bg-gray-200 rounded-xl overflow-hidden shadow-md group">
              <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800" alt="Latest Gadgets" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
            
            {/* Center Text & Button */}
            <motion.div variants={itemVars} style={{ opacity: textOpacity }} className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-30">
              <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-black text-gray-900 dark:text-white leading-[0.8] tracking-tighter mb-2">ULTIMATE</h1>
              {/* SALE with Outline effect */}
              <h1 className="text-7xl md:text-8xl lg:text-[7rem] font-serif font-black leading-[0.8] tracking-widest mb-6" style={{ WebkitTextStroke: '2px #a3a3a3', color: 'transparent' }}>
                SALE
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-8 uppercase tracking-[0.2em] font-medium">New Collection</p>
              <Link to="/products">
                <Button variant="primary" className="rounded-none px-12 py-4 bg-black text-white hover:bg-gray-800 transition-colors uppercase text-xs tracking-widest shadow-xl">Shop Now</Button>
              </Link>
            </motion.div>
            
            {/* Bottom Image */}
            <motion.div variants={itemVars} style={{ y: yCenter }} className="h-[25%] bg-gray-200 rounded-xl overflow-hidden shadow-md group absolute bottom-0 left-0 w-full z-0">
              <img src="https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&q=80&w=800" alt="Latest Gadgets" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>
          
          {/* Right Panel (Tall Image) */}
          <motion.div 
            variants={scaleVars}
            style={{ y: yRight }}
            className="lg:w-[30%] bg-gray-200 rounded-xl overflow-hidden shadow-lg h-[400px] lg:h-full relative group z-10"
          >
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800" alt="Pro Setup" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. BRANDS LOGOS */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="container mx-auto px-4 flex flex-wrap justify-center lg:justify-between items-center gap-10 group"
        >
          {['CHANEL', 'LOUIS VUITTON', 'PRADA', 'Calvin Klein', 'DENIM'].map((brand, i) => (
            <motion.span 
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="font-serif text-2xl md:text-3xl font-bold tracking-[0.15em] text-gray-400 dark:text-gray-600 transition-all duration-500 opacity-100 group-hover:opacity-30 hover:!opacity-100 hover:!text-black dark:hover:!text-white hover:scale-110 cursor-pointer"
            >
              {brand}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* 3. DEALS OF THE MONTH */}
      <DealsSection />

      {/* 4. NEW ARRIVALS */}
      <section ref={arrivalsRef} className="container mx-auto px-4 py-20 text-center relative">
        
        {/* Title & Description - Pinned to scroll slightly */}
        <motion.div 
          style={{ opacity: useTransform(arrScroll, [0, 0.2], [0, 1]), y: useTransform(arrScroll, [0, 0.3], [100, 0]) }}
        >
          <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">New Arrivals</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto text-sm leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis aliquam, aliquet faucibus mi eros justo.
          </p>
        </motion.div>
        
        {/* Animated Tabs */}
        <motion.div 
          style={{ opacity: useTransform(arrScroll, [0.1, 0.3], [0, 1]), y: useTransform(arrScroll, [0.1, 0.4], [50, 0]) }}
          className="flex flex-wrap justify-center gap-4 mb-16 relative z-20"
        >
          {['Women\'s Fashion', 'Men\'s Fashion', 'Women\'s Accessories', 'Men\'s Accessories', 'Discount Deals'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-semibold shadow-md tracking-wider transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-black text-white dark:bg-white dark:text-black scale-105' 
                  : 'bg-white text-gray-500 hover:text-black dark:bg-gray-800 dark:hover:text-white hover:scale-105'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Grid - Isotope + Continuous Parallax */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left mb-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredArrivals.map((product, i) => (
              <motion.div 
                key={product.id} 
                layout
                style={{ y: i % 3 === 0 ? yCol1 : i % 3 === 1 ? yCol2 : yCol3 }}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard {...product} onQuickView={() => setQuickViewProduct(product)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* View More Button */}
        <motion.div style={{ y: useTransform(arrScroll, [0.5, 1], [50, -50]) }}>
          <Button onClick={() => navigate('/products')} variant="primary" className="rounded-none bg-black text-white px-12 py-3 text-sm hover:scale-105 transition-transform duration-300 shadow-2xl">View More</Button>
        </motion.div>
      </section>

      <PromoSection />
      <FeaturesSection />
      <InstagramSection />
      <TestimonialsSection />
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
