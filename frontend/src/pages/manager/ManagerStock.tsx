import { useState } from 'react';
import { useStock, useCreateStockItem, useUpdateStockItem, useAdjustQuantity, useDeleteStockItem, useCategories } from '../../features/shop/hooks/useShop';
import type { StockItemResponse } from '../../features/shop/types';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, Edit2, Trash2, Package } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Modal } from '../../components/ui/Modal';

export const ManagerStock = () => {
  const { data: stockItems, isLoading } = useStock();
  const { mutate: createItem, isPending: isCreating } = useCreateStockItem();
  const { data: categories } = useCategories();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateStockItem();
  const { mutate: adjustQuantity } = useAdjustQuantity();
  const { mutate: deleteItem } = useDeleteStockItem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItemResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createItem({
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      quantity: Number(formData.get('quantity')),
      lowStockThreshold: Number(formData.get('lowStockThreshold')),
    }, {
      onSuccess: () => {
        toast.success("Article ajouté au stock !");
        setIsModalOpen(false);
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    const formData = new FormData(e.currentTarget);
    updateItem({
      id: editingItem.id,
      data: {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        price: Number(formData.get('price')),
        quantity: Number(formData.get('quantity')),
        lowStockThreshold: Number(formData.get('lowStockThreshold')),
      },
    }, {
      onSuccess: () => {
        toast.success("Produit mis à jour !");
        setEditingItem(null);
      },
      onError: () => toast.error("Erreur lors de la mise à jour du produit"),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" du stock ?`)) {
      deleteItem(id);
      toast.success("Article supprimé.");
    }
  };

  const handleAdjust = (id: number, currentQty: number, delta: number) => {
    if (currentQty + delta < 0) return;
    adjustQuantity({ id, data: { delta } });
  };

  const filteredItems = stockItems?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white tracking-tight">Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your products, pricing, and stock levels.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 shadow-sm transition-all"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:scale-105 transition-transform shadow-xl shadow-black/10 dark:shadow-white/10"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Price</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredItems?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Package size={48} className="mb-4 opacity-20" />
                      <p className="font-medium text-lg text-gray-900 dark:text-white mb-1">No products found</p>
                      <p className="text-sm">Try adjusting your search or add a new product.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems?.map((item) => {
                const isLow = item.quantity <= (item.lowStockThreshold || 5);
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs font-semibold text-gray-400">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold tracking-wide">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="font-bold text-gray-900 dark:text-white">${item.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3 bg-gray-50 dark:bg-white/5 w-fit mx-auto rounded-xl p-1 border border-gray-100 dark:border-white/5">
                        <button onClick={() => handleAdjust(item.id, item.quantity, -1)} className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">-</button>
                        <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                        <button onClick={() => handleAdjust(item.id, item.quantity, 1)} className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white">+</button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {isLow ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Low Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">In Stock</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Add New Product</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Fill in the details for the new inventory item.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                <input required name="name" placeholder="e.g. Mechanical Keyboard" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select name="category" defaultValue="" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white cursor-pointer">
                  <option value="" disabled>Select a category</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price ($)</label>
                  <input required type="number" step="0.01" min="0.01" name="price" placeholder="0.00" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Initial Stock</label>
                  <input required type="number" min="0" name="quantity" defaultValue="0" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Low Stock Alert Threshold</label>
                <input type="number" min="0" name="lowStockThreshold" defaultValue="5" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-xl shadow-black/10 dark:shadow-white/10">
                  {isCreating ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingItem && (
          <Modal onClose={() => setEditingItem(null)}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Edit Product</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Update the details for "{editingItem.name}".</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                <input required name="name" defaultValue={editingItem.name} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select name="category" defaultValue={editingItem.category ?? ''} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white cursor-pointer">
                  <option value="" disabled>Select a category</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {editingItem.category && !categories?.some(c => c.name === editingItem.category) && (
                    <option value={editingItem.category}>{editingItem.category} (legacy)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price ($)</label>
                  <input required type="number" step="0.01" min="0.01" name="price" defaultValue={editingItem.price} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock</label>
                  <input required type="number" min="0" name="quantity" defaultValue={editingItem.quantity} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Low Stock Alert Threshold</label>
                <input type="number" min="0" name="lowStockThreshold" defaultValue={editingItem.lowStockThreshold} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white" />
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-xl shadow-black/10 dark:shadow-white/10">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
