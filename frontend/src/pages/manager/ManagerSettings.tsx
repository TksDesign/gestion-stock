import { useMyShop, useUpdateMyShop } from '../../features/shop/hooks/useShop';
import toast from 'react-hot-toast';
import { Store, MapPin, Activity, CalendarDays, Save, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const ManagerSettings = () => {
  const { data: shop, isLoading } = useMyShop();
  const { mutate: updateShop, isPending } = useUpdateMyShop();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateShop(
      {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        zipCode: formData.get('zipCode') as string,
      },
      {
        onSuccess: () => toast.success("Store settings updated successfully!")
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-100 dark:border-white/10 rounded-full"></div>
          <div className="absolute w-16 h-16 border-4 border-black dark:border-white rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-8 bg-red-50/50 text-red-600 rounded-3xl border border-red-100 flex items-center justify-center">
        Store not found or access denied.
      </div>
    );
  }

  const containerAnim = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white tracking-tight">Store Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your store profile, location, and operational status.</p>
      </div>
      
      <motion.div variants={containerAnim} initial="hidden" animate="show" className="space-y-6">
        
        {/* Status Card */}
        <motion.div variants={itemAnim} className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                <Store size={28} className="text-gray-900 dark:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{shop.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Created {new Date(shop.createdDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Verified</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${shop.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  {shop.status === 'ACTIVE' ? 'Operational' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Information */}
          <motion.div variants={itemAnim} className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">General Information</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">Update your store's public facing details.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Name</label>
                <input required name="name" defaultValue={shop.name} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea name="description" rows={3} defaultValue={shop.description} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm resize-none custom-scrollbar dark:text-white" placeholder="What does your store sell?" />
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div variants={itemAnim} className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Location</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">Physical address for logistics and walk-in customers.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Street Address</label>
                <input name="street" defaultValue={shop.street} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm dark:text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                  <input name="city" defaultValue={shop.city} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Zip / Postal Code</label>
                  <input name="zipCode" defaultValue={shop.zipCode} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm dark:text-white" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <p className="text-sm text-gray-500">Please review all information before saving.</p>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm"
              >
                {isPending ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </motion.div>
        </form>

      </motion.div>
    </div>
  );
};
