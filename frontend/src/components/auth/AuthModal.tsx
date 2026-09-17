import { useEffect } from "react";
import { useAuthModalStore } from '../../store/authModalStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const InputField = ({ placeholder, type = "text" }: { placeholder: string, type?: string }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white"
  />
);

export const AuthModal = () => {
  const { isOpen, view, closeModal, setView } = useAuthModalStore();
  const { login } = useAuthStore();

  const imgLeft = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  // Animation Variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8 } },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const viewVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={closeModal} 
          />
          
          {/* Modal Container */}
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[600px] z-10"
          >
            
            {/* Close Button */}
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white z-20 transition-transform hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Left Side Image */}
            <div className="hidden md:block md:w-[45%] relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
               <motion.img 
                 initial={{ scale: 1.1 }}
                 animate={{ scale: 1 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 src={imgLeft} 
                 className="absolute inset-0 w-full h-full object-cover" 
               />
            </div>

            {/* Right Side Content */}
            <div className="w-full md:w-[55%] p-10 lg:p-16 flex flex-col relative overflow-hidden">
               
               <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">KSHOP</h2>

               <div className="flex-1 flex flex-col justify-center max-w-md relative">
                 <AnimatePresence mode="wait">
                   {view === 'signin' && (
                     <motion.div key="signin" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">Sign In To KSHOP</h3>
                       <p className="text-xs text-gray-500 mb-6 font-medium">
                         Since there is no backend authentication, signing in will automatically create a demo customer profile for you to test checkout.
                       </p>
                       <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const email = formData.get('email') as string;
                          try {
                            const { customerApi } = await import('../../features/customers/api/customerApi');
                            const id = await customerApi.create({ firstname: 'Demo', lastname: 'User', email });
                            login({ id, firstname: 'Demo', lastname: 'User', email }, 'mock-token');
                            closeModal();
                          } catch (err) {
                            console.error(err);
                            alert("Failed to sign in (API error)");
                          }
                       }}>
                         <input name="email" required placeholder="Email" type="email" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                         <input name="password" required placeholder="Password" type="password" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                         <Button type="submit" variant="primary" className="w-full rounded-md mt-4 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform">Sign In (Demo)</Button>
                         <Button type="button" variant="outline" onClick={() => setView('signup')} className="w-full rounded-md text-blue-600 border-blue-200 hover:bg-blue-50">Register Now</Button>
                       </form>
                     </motion.div>
                   )}

                   {view === 'signup' && (
                     <motion.div key="signup" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">Create Account</h3>
                       <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const firstname = formData.get('firstname') as string;
                          const lastname = formData.get('lastname') as string;
                          const email = formData.get('email') as string;
                          try {
                            const { customerApi } = await import('../../features/customers/api/customerApi');
                            const id = await customerApi.create({ firstname, lastname, email });
                            login({ id, firstname, lastname, email }, 'mock-token');
                            closeModal();
                          } catch (err) {
                            console.error(err);
                            alert("Failed to create customer (API error)");
                          }
                       }}>
                         <div className="grid grid-cols-2 gap-4">
                           <input name="firstname" required placeholder="First Name" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                           <input name="lastname" required placeholder="Last Name" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                           <input name="email" required placeholder="Email Address" type="email" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white col-span-2" />
                           <input required placeholder="Password" type="password" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                           <input required placeholder="Confirm Password" type="password" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                         </div>
                         <Button type="submit" variant="primary" className="w-full rounded-md mt-6 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform">Create Account</Button>
                       </form>
                       <div className="text-center mt-2">
                         <p className="text-xs text-gray-500 font-semibold">Already have an account? <button type="button" onClick={() => setView('signin')} className="text-blue-600 hover:underline">Login</button></p>
                       </div>
                     </motion.div>
                   )}

                   {view === 'forgot' && (
                     <motion.div key="forgot" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-8 mt-12">Forget Password</h3>
                       <form onSubmit={(e) => { e.preventDefault(); setView('verify'); }}>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                           <InputField placeholder="First Name" />
                           <InputField placeholder="Last Name" />
                           <InputField placeholder="Email Address" type="email" />
                           <InputField placeholder="Phone Number" type="tel" />
                         </div>
                         <Button type="submit" variant="primary" className="w-full rounded-md mt-6 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform">Send Confirmation Code</Button>
                       </form>
                       <div className="text-center mt-2">
                         <p className="text-xs text-gray-500 font-semibold">Already have an account? <button type="button" onClick={() => setView('signin')} className="text-blue-600 hover:underline">Login</button></p>
                       </div>
                     </motion.div>
                   )}

                   {view === 'verify' && (
                     <motion.div key="verify" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-8 mt-12">Enter The Confirmation Code</h3>
                       <form onSubmit={(e) => { e.preventDefault(); setView('signin'); }}>
                         <InputField placeholder="Confirmation Code" />
                         <Button type="submit" variant="primary" className="w-full rounded-md mt-6 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform">Recover Account</Button>
                       </form>
                       <div className="text-center mt-2">
                         <p className="text-xs text-gray-500 font-semibold">Didn't receive Confirmation Code? <button type="button" className="text-blue-600 hover:underline">Resend Now</button></p>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <div className="absolute bottom-6 right-8">
                 <p className="text-[10px] text-gray-500 font-medium">KSHOP Terms & Conditions</p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
