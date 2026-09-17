export const Footer = () => {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 bg-white dark:bg-gray-900 w-full mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
         <span className="text-4xl font-serif font-black tracking-widest text-gray-900 dark:text-white">KSHOP</span>
         <nav className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 font-semibold tracking-wide">
           <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Support</a>
           <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Invoicing</a>
           <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contract</a>
           <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Careers</a>
           <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Blog</a>
           <a href="#" className="hover:text-black dark:hover:text-white transition-colors">FAQs</a>
         </nav>
      </div>
      <p className="text-center text-xs text-gray-400 font-medium">Copyright © 2026 KSHOP. All Rights Reserved.</p>
    </footer>
  );
};
