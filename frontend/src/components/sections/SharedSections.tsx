import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

export const DealsSection = ({ title = "Deals Of The Month" }) => {
  const [time, setTime] = useState(2 * 86400 + 6 * 3600 + 5 * 60 + 30);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isTimerHovered, setIsTimerHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeData = [
    { num: String(Math.floor(time / 86400)).padStart(2, '0'), lbl: 'Days' },
    { num: String(Math.floor((time % 86400) / 3600)).padStart(2, '0'), lbl: 'Hr' },
    { num: String(Math.floor((time % 3600) / 60)).padStart(2, '0'), lbl: 'Mins' },
    { num: String(time % 60).padStart(2, '0'), lbl: 'Sec' }
  ];

  const dealImages = [
    { id: 0, src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400", label: "01 - Spring Sale", title: "MacBook Air", price: "$85.00", oldPrice: "$110.00" },
    { id: 1, src: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400", label: "02 - Summer Sale", title: "AirPods Pro 2", price: "$95.00", oldPrice: "$120.00" },
    { id: 2, src: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400", label: "03 - Autumn Sale", title: "Razer Blade 15", price: "$105.00", oldPrice: "$130.00" }
  ];

  const customEase = [0.16, 1, 0.3, 1];

  return (
    <section className="container mx-auto px-4 py-24 flex flex-col lg:flex-row items-center gap-16 overflow-hidden">
      
      {/* Left Column (Text & Timer) */}
      <div className="lg:w-1/3 z-20">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis aliquam, aliquet faucibus mi eros justo.
        </p>
        <Button variant="primary" className="rounded-none px-12 py-3 bg-black text-white hover:bg-gray-800 mb-12 shadow-lg text-sm transition-transform hover:scale-105 active:scale-95">Buy Now</Button>
        
        <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Hurry, Before It's Too Late!</h3>
        <div 
          className="flex gap-4 cursor-pointer"
          onMouseEnter={() => setIsTimerHovered(true)}
          onMouseLeave={() => setIsTimerHovered(false)}
        >
          {timeData.map((item, i) => (
            <motion.div 
              key={i} 
              animate={{ 
                y: isTimerHovered ? -10 : 0, 
                rotate: isTimerHovered ? (i % 2 === 0 ? 3 : -3) : 0,
                boxShadow: isTimerHovered ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
              }}
              transition={{ duration: 0.6, ease: customEase, delay: i * 0.05 }}
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 w-16 h-16 rounded-sm transition-colors"
            >
              <span className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-1">{item.num}</span>
              <span className="text-[9px] uppercase text-gray-500 font-semibold">{item.lbl}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Column (Images) - Interactive Accordion */}
      <div className="lg:w-2/3 w-full relative pt-12 pb-12">
         <div 
           className="flex items-center justify-center gap-4 relative h-[450px] w-full"
           onMouseEnter={() => setIsGalleryHovered(true)}
           onMouseLeave={() => { setIsGalleryHovered(false); setActiveIndex(1); }}
         >
            {dealImages.map((item, i) => {
              const isActive = activeIndex === i;
              return (
                <motion.div
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(i)}
                  layout
                  animate={{
                    width: isActive ? '60%' : '20%',
                    height: isActive ? '450px' : '350px',
                    opacity: isActive ? 1 : (isGalleryHovered ? 0.3 : 0.6),
                    filter: isActive ? 'blur(0px)' : (isGalleryHovered ? 'blur(4px)' : 'blur(2px)'),
                    zIndex: isActive ? 30 : 10
                  }}
                  transition={{ duration: 0.7, ease: customEase }}
                  className={`relative shadow-xl rounded-xl cursor-pointer ${!isActive ? 'hidden md:block' : 'block w-full'}`}
                >
                  <div className="w-full h-full overflow-hidden rounded-xl">
                    <motion.img 
                      animate={{ scale: isActive && isGalleryHovered ? 1.1 : 1 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      src={item.src} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Dynamic Price Card */}
                  <motion.div 
                    animate={{ 
                      opacity: isActive ? 1 : 0,
                      y: isActive && isGalleryHovered ? 20 : 0,
                      x: isActive && isGalleryHovered ? (i === 2 ? -20 : 20) : 0,
                    }}
                    transition={{ duration: 0.6, ease: customEase, delay: 0.1 }}
                    className={`absolute -bottom-6 ${i === 2 ? 'right-0 lg:-right-6' : 'left-0 lg:-left-6'} p-5 shadow-2xl w-48 lg:w-56 border rounded-sm transition-colors duration-500 z-40 pointer-events-none ${
                      isActive && isGalleryHovered 
                        ? 'bg-black border-black dark:bg-white dark:border-white' 
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <p className={`text-[10px] uppercase tracking-widest mb-2 font-semibold transition-colors duration-500 ${isActive && isGalleryHovered ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                    <p className={`font-bold text-base mb-2 transition-colors duration-500 ${isActive && isGalleryHovered ? 'text-white dark:text-black' : 'text-gray-900 dark:text-white'}`}>{item.title}</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold transition-colors duration-500 ${isActive && isGalleryHovered ? 'text-white dark:text-black' : 'text-gray-900 dark:text-white'}`}>
                        {item.price} <span className={`line-through ml-2 font-normal text-xs transition-colors duration-500 ${isActive && isGalleryHovered ? 'text-gray-500' : 'text-gray-400'}`}>{item.oldPrice}</span>
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
         </div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  const features = [
    { icon: "https://cdn-icons-png.flaticon.com/512/3252/3252994.png", title: "High Quality", desc: "crafted from top materials" },
    { icon: "https://cdn-icons-png.flaticon.com/512/3553/3553648.png", title: "Warranty Protection", desc: "over 2 years" },
    { icon: "https://cdn-icons-png.flaticon.com/512/66/66841.png", title: "Free Shipping", desc: "order over $150" },
    { icon: "https://cdn-icons-png.flaticon.com/512/3252/3252998.png", title: "24/7 Support", desc: "dedicated support" }
  ];

  return (
    <section className="container mx-auto px-4 py-16 border-b border-gray-200 dark:border-gray-800">
      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
          }
        }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100 dark:divide-gray-800"
      >
        {features.map((feat, i) => (
          <motion.div 
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            whileHover="hover"
            className="px-4 group cursor-pointer"
          >
            <motion.div 
              variants={{ hover: { y: -8, scale: 1.1 } }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-full group-hover:shadow-lg transition-shadow duration-300"
            >
              <img src={feat.icon} className="w-7 opacity-60 dark:invert group-hover:opacity-100 transition-opacity duration-300" alt={feat.title}/>
            </motion.div>
            <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white transition-colors group-hover:text-black dark:group-hover:text-gray-300">{feat.title}</h4>
            <p className="text-xs text-gray-500 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-400">{feat.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

const instaPositions = [
  { x: -100, y: 200, rotate: -20 },
  { x: -50, y: 250, rotate: 15 },
  { x: 0, y: 150, rotate: -10 },
  { x: 50, y: 300, rotate: 25 },
  { x: 100, y: 200, rotate: -15 },
  { x: 150, y: 250, rotate: 20 },
];

const instaImages = ["photo-1611186871340-1b26bc6594b5","photo-1618366712010-f4ae9c647dcb","photo-1603302576837-37561b2e2302","photo-1525547719571-a2d4ac8945e2","photo-1494173853739-c21f58b16055","photo-1516035069371-29a1b244cc32"];

const InstaCard = ({ num, index, hoveredIndex, setHoveredIndex, scrollYProgress }) => {
  const pos = instaPositions[index];
  
  // Connect entry animations strictly to the scroll position
  const x = useTransform(scrollYProgress, [0, 1], [pos.x, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [pos.y, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [pos.rotate, 0]);
  
  const isHovered = hoveredIndex === index;
  const isAnyHovered = hoveredIndex !== null;

  return (
    <motion.a
      href="#"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ x, y, rotate }} // Physics driven by scroll
      animate={{ 
        flex: isHovered ? 4 : isAnyHovered ? 0.8 : 1, // Physics driven by mouse hover
        opacity: isAnyHovered && !isHovered ? 0.3 : 1
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden cursor-pointer block border-r border-white dark:border-gray-900 last:border-0 h-full"
    >
       {/* Slow Pan on Image */}
       <motion.img 
         src={`https://images.unsplash.com/${instaImages[index % instaImages.length]}?auto=format&fit=crop&q=80&w=800`} 
         className="absolute inset-0 w-full h-full object-cover" 
         animate={{ scale: isHovered ? 1.1 : 1.05 }}
         transition={{ duration: 0.8, ease: "easeOut" }}
         alt="Instagram post" 
       />
       
       {/* Reveal Overlay Content */}
       <motion.div 
         animate={{ opacity: isHovered ? 1 : 0 }}
         transition={{ duration: 0.4 }}
         className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4"
       >
          <motion.div 
            animate={{ y: isHovered ? 0 : 20, scale: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </motion.div>
          
          <motion.span 
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white text-xs font-bold tracking-[0.2em] whitespace-nowrap"
          >
            SHOP THIS LOOK
          </motion.span>
       </motion.div>
    </motion.a>
  );
};

export const InstagramSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sectionRef = useRef(null);
  
  // Track scroll exactly over this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"] // Starts animating when it enters, finishes when it reaches center
  });

  return (
    <section ref={sectionRef} className="py-24 text-center bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800 overflow-hidden">
      
      <motion.div 
        style={{ opacity: scrollYProgress, scale: useTransform(scrollYProgress, [0, 1], [0.8, 1]) }}
        className="mb-16 flex flex-col items-center"
      >
         <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 md:w-24 h-[1px] bg-black dark:bg-white opacity-20"></div>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white tracking-tighter uppercase">
              Instagram
            </h2>
            <div className="w-12 md:w-24 h-[1px] bg-black dark:bg-white opacity-20"></div>
         </div>
         <p className="text-gray-500 dark:text-gray-400 text-sm tracking-[0.3em] uppercase font-bold">
           @KSHOP_Official
         </p>
      </motion.div>

      {/* Edge-to-Edge Expanding Accordion Grid with Scroll Parallax */}
      <div className="flex w-full h-[300px] md:h-[450px]">
        {[1, 2, 3, 4, 5, 6].map((num, i) => (
           <InstaCard 
             key={i} 
             num={num} 
             index={i} 
             hoveredIndex={hoveredIndex} 
             setHoveredIndex={setHoveredIndex} 
             scrollYProgress={scrollYProgress} 
           />
        ))}
      </div>
    </section>
  );
};

const testimonials = [
  { id: 1, name: "James K.", role: "Software Engineer", text: "The quality is simply unmatched. I've taken this everywhere and it still looks brand new. The attention to detail in the craftsmanship is genuinely impressive.", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=150" },
  { id: 2, name: "Sarah M.", role: "Tech Reviewer", text: "Incredible style and unbelievable comfort. I've never felt more confident. The delivery was remarkably fast, and the unboxing experience felt truly premium.", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=150" },
  { id: 3, name: "David L.", role: "Product Designer", text: "A truly luxurious experience from start to finish. The aesthetic is perfectly balanced. It's rare to find a brand that delivers on both form and function like this.", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=150" },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(1);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="bg-gray-50 dark:bg-gray-800/20 py-32 overflow-hidden border-t border-gray-100 dark:border-gray-800 relative">
       {/* Decorative Background Quote Mark */}
       <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[300px] text-gray-100 dark:text-gray-800/30 font-serif font-black opacity-40 pointer-events-none select-none z-0">
         "
       </div>

       <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">
              What Customers Say
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-20 text-sm tracking-[0.2em] uppercase font-semibold">
              Real reviews from our community
            </p>
          </motion.div>

          {/* 3D Carousel Container */}
          <div className="relative w-full max-w-6xl mx-auto h-[350px] md:h-[250px] flex items-center justify-center perspective-[1000px]">
             {testimonials.map((testimonial, i) => {
                // Determine position logic
                let position = "hidden";
                if (i === currentIndex) position = "active";
                else if (i === (currentIndex - 1 + testimonials.length) % testimonials.length) position = "prev";
                else if (i === (currentIndex + 1) % testimonials.length) position = "next";

                // Define variants for 3D Coverflow
                const variants = {
                   active: { x: 0, scale: 1, opacity: 1, zIndex: 20, filter: "blur(0px)", rotateY: 0 },
                   prev: { x: "-40%", scale: 0.75, opacity: 0.3, zIndex: 10, filter: "blur(3px)", rotateY: 15 },
                   next: { x: "40%", scale: 0.75, opacity: 0.3, zIndex: 10, filter: "blur(3px)", rotateY: -15 },
                   hidden: { x: 0, scale: 0.5, opacity: 0, zIndex: 0, filter: "blur(5px)", rotateY: 0 }
                };

                return (
                  <motion.div
                    key={testimonial.id}
                    variants={variants}
                    animate={position}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute w-full max-w-md md:max-w-2xl bg-white dark:bg-gray-900 p-8 md:p-10 shadow-2xl rounded-sm flex flex-col md:flex-row gap-8 items-center text-left"
                  >
                    <div className="shrink-0 relative">
                       <img src={testimonial.img} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg" alt={testimonial.name} />
                       <div className="absolute -bottom-2 -right-2 bg-black dark:bg-white text-white dark:text-black w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif shadow-lg">"</div>
                    </div>
                    <div>
                       <div className="flex text-yellow-400 mb-4 text-xs tracking-widest gap-1">
                         {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                       </div>
                       <p className="italic text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                         "{testimonial.text}"
                       </p>
                       <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{testimonial.name}</h4>
                       <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{testimonial.role}</p>
                    </div>
                  </motion.div>
                )
             })}
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-6 mt-16 relative z-10">
             <button onClick={prevSlide} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-110 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 text-gray-600 dark:text-gray-300 group">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <button onClick={nextSlide} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-110 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 text-gray-600 dark:text-gray-300 group">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
             </button>
          </div>
       </div>
    </section>
  )
}

export const NewsletterSection = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSectionHovered, setIsSectionHovered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 4000); // Reset after 4s
  };

  return (
    <section 
      className="container mx-auto px-4 py-32 overflow-hidden"
      onMouseEnter={() => setIsSectionHovered(true)}
      onMouseLeave={() => setIsSectionHovered(false)}
    >
       <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
          
          {/* Left Floating Image (Expands out on section hover) */}
          <motion.div
            animate={{ 
              x: isSectionHovered ? 0 : 80, 
              rotate: isSectionHovered ? -12 : 0,
              opacity: isSectionHovered ? 1 : 0.2,
              scale: isSectionHovered ? 1 : 0.8
            }}
            transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
            className="hidden lg:block w-56 relative z-10"
          >
            <motion.img 
              animate={isSectionHovered ? { y: [-20, 20, -20] } : { y: 0 }} 
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400" 
              className="w-full drop-shadow-2xl rounded-sm filter grayscale hover:grayscale-0 transition-all duration-700" 
              alt="Fashion Inspiration"
            />
          </motion.div>

          {/* Center Content */}
          <motion.div 
            animate={{ scale: isSectionHovered ? 1.02 : 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center flex-1 relative z-20"
          >
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tighter uppercase transition-colors">
               Join The Club
             </h2>
             <p className="text-gray-500 dark:text-gray-400 mb-12 text-sm max-w-md mx-auto leading-relaxed">
               Subscribe to our newsletter and get <span className="font-bold text-gray-900 dark:text-white">20% off</span> your first purchase. Plus, get early access to new drops!
             </p>
             
             <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`flex shadow-2xl border transition-all overflow-hidden rounded-sm p-1.5 ${
                    isSectionHovered 
                      ? 'border-gray-300 dark:border-gray-600 shadow-black/10' 
                      : 'border-gray-100 dark:border-gray-800'
                  } bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white`}
                >
                   <input 
                     type="email" 
                     required
                     placeholder="your@email.com" 
                     className="flex-1 bg-transparent px-6 py-4 text-sm font-medium focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" 
                   />
                   <AnimatePresence mode="wait">
                     {!isSubscribed ? (
                       <motion.button 
                         key="submit"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         type="submit" 
                         className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 uppercase text-xs font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md"
                       >
                         Subscribe
                       </motion.button>
                     ) : (
                       <motion.button 
                         key="success"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.5 }}
                         type="button" 
                         className="bg-green-500 text-white px-10 py-4 uppercase text-xs font-bold tracking-widest flex items-center justify-center gap-2 shadow-md"
                       >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         Done
                       </motion.button>
                     )}
                   </AnimatePresence>
                </motion.div>
             </form>
          </motion.div>

          {/* Right Floating Image (Expands out on section hover) */}
          <motion.div
            animate={{ 
              x: isSectionHovered ? 0 : -80, 
              rotate: isSectionHovered ? 12 : 0,
              opacity: isSectionHovered ? 1 : 0.2,
              scale: isSectionHovered ? 1 : 0.8
            }}
            transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
            className="hidden lg:block w-56 relative z-10"
          >
            <motion.img 
              animate={isSectionHovered ? { y: [20, -20, 20] } : { y: 0 }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=400" 
              className="w-full drop-shadow-2xl rounded-sm filter grayscale hover:grayscale-0 transition-all duration-700" 
              alt="Fashion Style"
            />
          </motion.div>
       </div>
    </section>
  );
};

export const PromoSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Scroll linked transformations
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);
  
  const textX = useTransform(scrollYProgress, [0.2, 0.6], [100, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  
  const boxY = useTransform(scrollYProgress, [0.3, 0.8], [50, -50]);

  return (
    <section ref={ref} className="w-full bg-[#E5E5E5] dark:bg-gray-800 mt-16 overflow-hidden relative">
      <div className="container mx-auto px-0 lg:px-4 flex flex-col lg:flex-row h-auto lg:h-[600px]">
        {/* Left Image (Peaky Blinders) with Scroll Parallax */}
        <div className="lg:w-1/2 h-[400px] lg:h-full relative overflow-hidden">
          <motion.img 
            style={{ y: imageY, scale: imageScale }}
            src="https://images.unsplash.com/photo-1504610926078-a1611febcad3?auto=format&fit=crop&q=80&w=800" 
            className="w-full h-[130%] object-cover object-top absolute top-0" 
            alt="Peaky Blinders Promo"
          />
        </div>
        
        {/* Right Content with Scroll Translation */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
          <motion.div 
            style={{ x: textX, opacity: textOpacity, y: boxY }}
            className="bg-white dark:bg-gray-900 p-10 lg:p-16 shadow-2xl relative z-10 max-w-lg w-full"
          >
            <p className="text-gray-500 uppercase tracking-[0.3em] text-xs font-semibold mb-4">Women Collection</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">Peaky Blinders</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm underline underline-offset-4 decoration-gray-300">Description</p>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis aliquam, aliquet faucibus mi eros justo.
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">$100.00</span>
              <Button variant="primary" className="rounded-none bg-black text-white dark:bg-white dark:text-black px-8 py-3 text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg">Buy Now</Button>
            </div>
          </motion.div>
          
          {/* Decorative Background Element */}
          <motion.div 
            style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, 45]) }}
            className="absolute top-10 right-10 w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-full opacity-30 pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
};
