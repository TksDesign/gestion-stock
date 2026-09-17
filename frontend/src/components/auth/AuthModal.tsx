import { useEffect, useState } from "react";
import { useAuthModalStore } from '../../store/authModalStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../features/auth/api/authApi';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const InputField = ({ placeholder, type = "text", name, required = false }: { placeholder: string, type?: string, name?: string, required?: boolean }) => (
  <input
    name={name}
    required={required}
    type={type}
    placeholder={placeholder}
    className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white"
  />
);

export const AuthModal = () => {
  const { isOpen, view, closeModal, setView } = useAuthModalStore();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const imgLeft = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      const response = await authApi.login({ email, password });
      login(
        {
          id: response.userId,
          firstname: response.firstname,
          lastname: response.lastname,
          email: response.email,
          role: response.role,
          customerId: response.customerId,
        },
        response.token
      );
      toast.success(`Bienvenue, ${response.firstname} !`);
      closeModal();
    } catch {
      // axios interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register({ firstname, lastname, email, password });
      login(
        {
          id: response.userId,
          firstname: response.firstname,
          lastname: response.lastname,
          email: response.email,
          role: response.role,
          customerId: response.customerId,
        },
        response.token
      );
      toast.success('Compte créé avec succès !');
      closeModal();
    } catch {
      // axios interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={closeModal}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[600px] z-10"
          >

            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white z-20 transition-transform hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="hidden md:block md:w-[45%] relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
               <motion.img
                 initial={{ scale: 1.1 }}
                 animate={{ scale: 1 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 src={imgLeft}
                 className="absolute inset-0 w-full h-full object-cover"
               />
            </div>

            <div className="w-full md:w-[55%] p-10 lg:p-16 flex flex-col relative overflow-hidden">

               <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">KSHOP</h2>

               <div className="flex-1 flex flex-col justify-center max-w-md relative">
                 <AnimatePresence mode="wait">
                   {view === 'signin' && (
                     <motion.div key="signin" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">Se connecter</h3>
                       <form onSubmit={handleLogin}>
                         <input name="email" required placeholder="Email" type="email" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                         <input name="password" required placeholder="Mot de passe" type="password" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                         <Button type="submit" variant="primary" disabled={loading} className="w-full rounded-md mt-4 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
                           {loading ? 'Connexion...' : 'Se connecter'}
                         </Button>
                         <Button type="button" variant="outline" onClick={() => setView('signup')} className="w-full rounded-md text-blue-600 border-blue-200 hover:bg-blue-50">Créer un compte</Button>
                       </form>
                     </motion.div>
                   )}

                   {view === 'signup' && (
                     <motion.div key="signup" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">Créer un compte</h3>
                       <form onSubmit={handleRegister}>
                         <div className="grid grid-cols-2 gap-4">
                           <input name="firstname" required placeholder="Prénom" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                           <input name="lastname" required placeholder="Nom" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                           <input name="email" required placeholder="Adresse email" type="email" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white col-span-2" />
                           <input name="password" required placeholder="Mot de passe" type="password" minLength={6} className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                           <input name="confirmPassword" required placeholder="Confirmer le mot de passe" type="password" className="w-full border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 mb-4 dark:text-white" />
                         </div>
                         <Button type="submit" variant="primary" disabled={loading} className="w-full rounded-md mt-6 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
                           {loading ? 'Création...' : 'Créer le compte'}
                         </Button>
                       </form>
                       <div className="text-center mt-2">
                         <p className="text-xs text-gray-500 font-semibold">Déjà un compte ? <button type="button" onClick={() => setView('signin')} className="text-blue-600 hover:underline">Se connecter</button></p>
                       </div>
                     </motion.div>
                   )}

                   {view === 'forgot' && (
                     <motion.div key="forgot" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-8 mt-12">Mot de passe oublié</h3>
                       <form onSubmit={(e) => { e.preventDefault(); setView('verify'); }}>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                           <InputField name="firstname" placeholder="Prénom" required />
                           <InputField name="lastname" placeholder="Nom" required />
                           <InputField name="email" placeholder="Adresse email" type="email" required />
                           <InputField name="phone" placeholder="Téléphone" type="tel" />
                         </div>
                         <Button type="submit" variant="primary" className="w-full rounded-md mt-6 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform">Envoyer le code</Button>
                       </form>
                       <div className="text-center mt-2">
                         <p className="text-xs text-gray-500 font-semibold">Déjà un compte ? <button type="button" onClick={() => setView('signin')} className="text-blue-600 hover:underline">Se connecter</button></p>
                       </div>
                     </motion.div>
                   )}

                   {view === 'verify' && (
                     <motion.div key="verify" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
                       <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-8 mt-12">Entrer le code de confirmation</h3>
                       <form onSubmit={(e) => { e.preventDefault(); setView('signin'); }}>
                         <InputField name="code" placeholder="Code de confirmation" required />
                         <Button type="submit" variant="primary" className="w-full rounded-md mt-6 mb-4 bg-black text-white shadow-lg hover:scale-[1.02] transition-transform">Récupérer le compte</Button>
                       </form>
                       <div className="text-center mt-2">
                         <p className="text-xs text-gray-500 font-semibold">Code non reçu ? <button type="button" className="text-blue-600 hover:underline">Renvoyer</button></p>
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
