import { useMemo, useState } from 'react';
import { useUsers } from '../../features/auth/hooks/useUsers';
import { useAllShops, useReassignManager } from '../../features/shop/hooks/useShop';
import toast from 'react-hot-toast';

export const AdminManagers = () => {
  const { data: managers, isLoading: isLoadingManagers } = useUsers('SHOP_MANAGER');
  const { data: shops, isLoading: isLoadingShops } = useAllShops();
  const { mutate: reassignManager, isPending: isReassigning } = useReassignManager();

  const [searchQuery, setSearchQuery] = useState('');
  const [reassignTarget, setReassignTarget] = useState<{ managerId: string; managerEmail: string } | null>(null);

  const isLoading = isLoadingManagers || isLoadingShops;

  const shopByManagerId = useMemo(() => {
    const map = new Map<string, (typeof shops)[number]>();
    (shops ?? []).forEach(shop => {
      if (shop.managerId) map.set(shop.managerId, shop);
    });
    return map;
  }, [shops]);

  const unassignedShops = useMemo(
    () => (shops ?? []).filter(s => !s.managerId),
    [shops]
  );

  const filteredManagers = (managers ?? []).filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      `${m.firstname} ${m.lastname}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const handleAssign = (shopId: number, shopName: string) => {
    if (!reassignTarget) return;
    reassignManager(
      { id: shopId, managerId: reassignTarget.managerId, managerEmail: reassignTarget.managerEmail },
      {
        onSuccess: () => {
          toast.success(`Boutique "${shopName}" assignée`);
          setReassignTarget(null);
        },
        onError: (err: any) => toast.error(err.response?.data?.errors?.error || "Erreur lors de l'assignation"),
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Gestion des Gérantes</h1>
        <input
          type="text"
          placeholder="Rechercher une gérante..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gérante</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Boutique</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    Aucune gérante trouvée.
                  </td>
                </tr>
              ) : (
                filteredManagers.map(manager => {
                  const shop = shopByManagerId.get(manager.id);
                  return (
                    <tr key={manager.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {manager.firstname[0]}{manager.lastname[0]}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{manager.firstname} {manager.lastname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{manager.email}</td>
                      <td className="px-6 py-4">
                        {shop ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {shop.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            Sans boutique
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!shop && (
                          <button
                            onClick={() => setReassignTarget({ managerId: manager.id, managerEmail: manager.email })}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Assigner une boutique
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-serif font-bold mb-2 text-gray-900 dark:text-white">Assigner une boutique</h2>
            <p className="text-sm text-gray-500 mb-6">Choisissez une boutique sans gérante à assigner à {reassignTarget.managerEmail}.</p>

            {unassignedShops.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">Aucune boutique disponible sans gérante.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                {unassignedShops.map(shop => (
                  <button
                    key={shop.id}
                    disabled={isReassigning}
                    onClick={() => handleAssign(shop.id, shop.name)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                  >
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{shop.name}</p>
                    <p className="text-xs text-gray-500">{shop.city || 'Aucune adresse'}</p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setReassignTarget(null)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
