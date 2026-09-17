import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { NewsletterSection } from '../components/sections/SharedSections';
import { useForm } from 'react-hook-form';
import { useCreateOrder } from '../features/orders/hooks/useOrders';
import { PaymentMethod } from '../features/orders/types';
import toast from 'react-hot-toast';

type CheckoutFormData = { email: string; firstName: string; lastName: string; address: string; city: string; postalCode: string;
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
  cardHolderName: string;
};

export const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const createOrderMutation = useCreateOrder();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>();

  const subtotal = getTotal();
  const shipping = subtotal > 150 ? 0 : 4.00; // Mock rule based on free shipping threshold
  const total = subtotal + shipping;

  const onSubmit = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to checkout.");
        return;
      }

      // 1. Créer la commande en utilisant l'ID du client authentifié
      await createOrderMutation.mutateAsync({
        amount: total,
        paymentMethod: PaymentMethod.CREDIT_CARD, // Hardcodé pour l'instant
        customerId: user.id,
        products: items.map(item => ({
          productId: Number(item.productId),
          quantity: item.quantity
        }))
      });

      // 2. Succès
      clearCart();
      navigate('/success');
    } catch (error) {
      toast.error("Erreur lors de la validation de la commande.");
      console.error(error);
    }
  };

  return (
    <div className="w-full font-sans bg-white dark:bg-gray-900">
      
      {/* Title */}
      <div className="text-center py-10 border-b border-gray-100 dark:border-gray-800">
         <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">KSHOP Demo Checkout</h1>
      </div>

      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Left: Form */}
        <div className="w-full lg:w-[55%] p-8 lg:p-12 border-r border-gray-100 dark:border-gray-800">
           <form onSubmit={handleSubmit(onSubmit)}>
             {/* Contact */}
             <div className="mb-10">
                <div className="flex justify-between items-baseline mb-4">
                   <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Contact</h2>
                   <p className="text-sm text-gray-500">Have an account? <button type="button" onClick={() => useAuthModalStore.getState().openModal('signin')} className="text-blue-600 hover:underline">Login</button></p>
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  {...register("email", { required: true })}
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white mb-1" 
                />
                {errors.email && <span className="text-xs text-red-500">Ce champ est requis</span>}
             </div>

             {/* Delivery */}
             <div className="mb-10">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4">Delivery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <select className="col-span-1 md:col-span-2 p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white appearance-none">
                      <option>Country / Region</option>
                      <option>United States</option>
                      <option>France</option>
                   </select>
                   <div>
                     <input type="text" placeholder="First Name" {...register("firstName", { required: true })} className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                     {errors.firstName && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div>
                     <input type="text" placeholder="Last Name" {...register("lastName", { required: true })} className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                     {errors.lastName && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div className="col-span-1 md:col-span-2">
                     <input type="text" placeholder="Address" {...register("address", { required: true })} className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                     {errors.address && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div>
                     <input type="text" placeholder="City" {...register("city", { required: true })} className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                     {errors.city && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                   <div>
                     <input type="text" placeholder="Postal Code" {...register("postalCode", { required: true })} className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-transparent rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                     {errors.postalCode && <span className="text-xs text-red-500">Requis</span>}
                   </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-sm group-hover:border-black dark:group-hover:border-white transition-colors">
                     <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer" />
                     <svg className="w-3 h-3 text-transparent group-hover:text-black dark:group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-sm text-gray-500">Save this info for future</span>
                </label>
             </div>

             {/* Payment */}
             <div className="mb-10">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4">Payment</h2>
                <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden mb-4 bg-gray-50 dark:bg-gray-800">
                   <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center">
                      <span className="text-sm font-medium">Credit Card</span>
                      <div className="flex gap-2 h-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" className="h-full object-contain" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" className="h-full object-contain" />
                      </div>
                   </div>
                   <div className="p-4 grid grid-cols-2 gap-4">
                      <div>
                        <input type="text" placeholder="Card Number" {...register("cardNumber", { required: true })} className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                        {errors.cardNumber && <span className="text-xs text-red-500">Requis</span>}
                      </div>
                      <div className="col-start-1">
                        <input type="text" placeholder="Expiration Date" {...register("expirationDate", { required: true })} className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                        {errors.expirationDate && <span className="text-xs text-red-500">Requis</span>}
                      </div>
                      <div>
                        <input type="text" placeholder="Security Code" {...register("securityCode", { required: true })} className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                        {errors.securityCode && <span className="text-xs text-red-500">Requis</span>}
                      </div>
                      <div className="col-span-2">
                        <input type="text" placeholder="Card holder name" {...register("cardHolderName", { required: true })} className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
                        {errors.cardHolderName && <span className="text-xs text-red-500">Requis</span>}
                      </div>
                   </div>
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={createOrderMutation.isPending || items.length === 0}
                  className="w-full h-14 bg-black text-white rounded-md mb-8 shadow-xl uppercase tracking-widest text-sm"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Pay Now"}
                </Button>
                <p className="text-center text-xs text-gray-400">Copyright © 2026 KSHOP. All Rights Reserved.</p>
             </div>
           </form>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[45%] bg-gray-50 dark:bg-gray-900/50 p-8 lg:p-12">
           <div className="flex flex-col gap-6 mb-8">
              {items.map(item => (
                <div key={`${item.productId}-${item.variant}`} className="flex gap-4 items-center relative">
                   <div className="relative w-16 h-20 flex-shrink-0">
                     <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                       <img src={item.imageUrl || item.image} className="w-full h-full object-cover" />
                     </div>
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10">{item.quantity}</span>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</h4>
                     {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                   </div>
                   <span className="font-bold text-sm text-gray-900 dark:text-white">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500">Votre panier est vide.</p>}
           </div>
           
           <div className="flex gap-4 mb-8">
              <input type="text" placeholder="Discount code" className="flex-1 p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm text-sm focus:outline-none focus:border-black dark:focus:border-white" />
              <Button variant="primary" className="px-6 bg-black text-white rounded-md">Apply</Button>
           </div>

           <div className="flex flex-col gap-4 text-sm mb-6 border-b border-gray-200 dark:border-gray-800 pb-6">
              <div className="flex justify-between">
                 <span className="text-gray-500">Subtotal</span>
                 <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                 <span className="text-gray-500">Shipping</span>
                 <span className="font-medium text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
              </div>
           </div>
           
           <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-2xl text-gray-900 dark:text-white">${total.toFixed(2)}</span>
           </div>
        </div>

      </div>

      <NewsletterSection />
    </div>
  );
};
