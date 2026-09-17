import { useState } from 'react';
import { useAllShops, useCreateShop, useUpdateShopStatus, useUpdateShop } from '../../features/shop/hooks/useShop';
import type { ShopResponse } from '../../features/shop/types';
import { authApi, CreateManagerRequest } from '../../features/auth/api/authApi';
import toast from 'react-hot-toast';

export const AdminShops = () => {
  const { data: shops, isLoading } = useAllShops();
  const { mutate: createShop, isPending: isCreatingShop } = useCreateShop();
  const { mutate: updateStatus } = useUpdateShopStatus();
  const { mutate: updateShop, isPending: isUpdatingShop } = useUpdateShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [editingShop, setEditingShop] = useState<ShopResponse | null>(null);

  const handleToggleStatus = (id: number, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    updateStatus({ id, status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  const handleCreateComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingManager(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      // 1. Créer le Manager
      const managerReq: CreateManagerRequest = {
        firstname: formData.get('m_firstname') as string,
        lastname: formData.get('m_lastname') as string,
        email: formData.get('m_email') as string,
        password: formData.get('m_password') as string,
      };
      
      const managerRes = await authApi.createShopManager(managerReq);
      
      // 2. Créer la Boutique
      createShop({
        name: formData.get('s_name') as string,
        description: formData.get('s_desc') as string,
        street: formData.get('s_street') as string,
        city: formData.get('s_city') as string,
        zipCode: formData.get('s_zip') as string,
        managerId: managerRes.userId,
        managerEmail: managerRes.email,
      }, {
        onSuccess: () => {
          toast.success("Boutique et gérante créées avec succès !");
          setIsModalOpen(false);
        },
        onError: () => toast.error("Erreur lors de la création de la boutique")
      });
      
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.error || "Erreur lors de la création de la gérante");
    } finally {
      setIsCreatingManager(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Gestion des Boutiques</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          + Nouvelle Boutique
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            Aucune boutique enregistrée.
          </div>
        ) : (
          shops?.map(shop => (
            <div key={shop.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{shop.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{shop.city ? `${shop.city} (${shop.zipCode})` : 'Aucune adresse'}</p>
                </div>
                <button
                  onClick={() => handleToggleStatus(shop.id, shop.status)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                    shop.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {shop.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
              
              <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p className="line-clamp-2">{shop.description || 'Aucune description'}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-50 dark:border-gray-700 mt-auto">
                <p className="text-xs text-gray-500 mb-1">Gérée par :</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {shop.managerEmail ? shop.managerEmail.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {shop.managerEmail || 'Aucune gérante'}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingShop(shop)}
                    className="flex-shrink-0 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">Créer une Boutique et une Gérante</h2>
            
            <form onSubmit={handleCreateComplete} className="space-y-8">
              {/* Section Manager */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Le compte de la Gérante</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prénom *</label>
                    <input required name="m_firstname" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom *</label>
                    <input required name="m_lastname" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email (login) *</label>
                    <input required type="email" name="m_email" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mot de passe *</label>
                    <input required type="password" minLength={6} name="m_password" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Section Shop */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Les infos de la Boutique</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom de la boutique *</label>
                  <input required name="s_name" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input name="s_desc" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
                    <input name="s_street" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Code Postal</label>
                    <input name="s_zip" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
                  <input name="s_city" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isCreatingManager || isCreatingShop} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {isCreatingManager ? 'Création gérante...' : isCreatingShop ? 'Création boutique...' : 'Créer l\'ensemble'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-white">Modifier "{editingShop.name}"</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateShop(
                  {
                    id: editingShop.id,
                    data: {
                      name: formData.get('name') as string,
                      description: formData.get('description') as string,
                      street: formData.get('street') as string,
                      city: formData.get('city') as string,
                      zipCode: formData.get('zipCode') as string,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success('Boutique mise à jour !');
                      setEditingShop(null);
                    },
                    onError: () => toast.error('Erreur lors de la mise à jour'),
                  }
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom de la boutique *</label>
                <input required name="name" defaultValue={editingShop.name} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input name="description" defaultValue={editingShop.description ?? ''} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
                  <input name="street" defaultValue={editingShop.street ?? ''} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Code Postal</label>
                  <input name="zipCode" defaultValue={editingShop.zipCode ?? ''} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
                <input name="city" defaultValue={editingShop.city ?? ''} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setEditingShop(null)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isUpdatingShop} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {isUpdatingShop ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
