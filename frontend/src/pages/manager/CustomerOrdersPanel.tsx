import { useMemo, useState } from 'react';
import { useSales, useUpdateSaleItemStatus } from '../../features/shop/hooks/useShop';
import type { SaleItemStatus } from '../../features/shop/types';
import { groupByDay, groupSalesByCustomer, filterSales, paginate, type GroupedOrder } from '../../features/shop/utils/groupOrders';
import { Package, User, Search, ChevronDown, Calendar, Users2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Pagination } from '../../components/ui/Pagination';

const STATUS_OPTIONS: SaleItemStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'EXPIRED'];

const STATUS_LABELS: Record<SaleItemStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  EXPIRED: 'Expirée',
};

const STATUS_STYLES: Record<SaleItemStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:border-white/10',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
  PREPARING: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800',
  SHIPPED: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800',
  EXPIRED: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800',
};

const PAGE_SIZE = 5;

type ViewMode = 'day' | 'customer';

export const CustomerOrdersPanel = () => {
  const { data: sales, isLoading } = useSales();
  const { mutate: updateStatus, isPending } = useUpdateSaleItemStatus();

  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleItemStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  const onlineSales = useMemo(() => (sales ?? []).filter(s => s.source === 'ONLINE'), [sales]);
  const filteredSales = useMemo(
    () => filterSales(onlineSales, searchQuery, statusFilter),
    [onlineSales, searchQuery, statusFilter]
  );

  const dayGroups = useMemo(() => groupByDay(filteredSales), [filteredSales]);
  const customerGroups = useMemo(() => groupSalesByCustomer(filteredSales), [filteredSales]);

  const totalTopLevel = viewMode === 'day' ? dayGroups.length : customerGroups.length;
  const pagedDayGroups = paginate(dayGroups, page, PAGE_SIZE);
  const pagedCustomerGroups = paginate(customerGroups, page, PAGE_SIZE);

  const changeStatus = (saleId: number, itemId: number, status: SaleItemStatus) => {
    updateStatus(
      { saleId, itemId, data: { status } },
      {
        onSuccess: () => toast.success(`Statut mis à jour : ${STATUS_LABELS[status]}`),
        onError: () => toast.error("Erreur lors de la mise à jour du statut"),
      }
    );
  };

  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev => {
      const next = new Set(prev);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: SaleItemStatus | 'ALL') => {
    setStatusFilter(value);
    setPage(1);
  };

  const renderOrderCard = (order: GroupedOrder) => (
    <div
      key={order.key}
      className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
    >
      <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
        <div>
          <p className="text-xs text-gray-400 font-mono">{order.orderReference}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(order.createdDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            {' à '}
            {new Date(order.createdDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {order.items.map(item => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{item.stockItemName}</p>
              <p className="text-xs text-gray-500">Qté {item.quantity} · ${item.unitPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <select
                disabled={isPending}
                value={item.status}
                onChange={(e) => changeStatus(item.saleId, item.id, e.target.value as SaleItemStatus)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 disabled:opacity-50 cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-100 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Client, référence, produit..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as SaleItemStatus | 'ALL')}
            className="flex-1 min-w-0 sm:flex-none bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 shadow-sm cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            <button
              onClick={() => handleViewModeChange('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${viewMode === 'day' ? 'bg-white dark:bg-[#111111] text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              <Calendar size={14} /> Jour
            </button>
            <button
              onClick={() => handleViewModeChange('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${viewMode === 'customer' ? 'bg-white dark:bg-[#111111] text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              <Users2 size={14} /> Client
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredSales.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Package size={40} className="mb-3 opacity-30" />
          <p className="font-medium text-sm">
            {onlineSales.length === 0 ? 'Aucune commande client pour le moment.' : 'Aucun résultat pour ces critères.'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-1">
          {viewMode === 'day'
            ? pagedDayGroups.map(group => (
                <div key={group.label}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                    {group.label} · {group.entries.length} vente{group.entries.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-4">
                    {group.entries.map(sale => (
                      <div
                        key={sale.id}
                        className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                      >
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                              <User size={16} className="text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white">
                                {sale.customerFirstname} {sale.customerLastname}
                              </p>
                              <p className="text-xs text-gray-500">
                                {sale.customerEmail} · {new Date(sale.createdDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 font-mono">{sale.orderReference}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">${sale.totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                          {sale.items.map(item => (
                            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{item.stockItemName}</p>
                                <p className="text-xs text-gray-500">Qté {item.quantity} · ${item.unitPrice.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>
                                  {STATUS_LABELS[item.status]}
                                </span>
                                <select
                                  disabled={isPending}
                                  value={item.status}
                                  onChange={(e) => changeStatus(sale.id, item.id, e.target.value as SaleItemStatus)}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 disabled:opacity-50 cursor-pointer"
                                >
                                  {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            : pagedCustomerGroups.map(customer => {
                const isExpanded = expandedCustomers.has(customer.customerId);
                return (
                  <div
                    key={customer.customerId}
                    className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleCustomer(customer.customerId)}
                      className="w-full p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <User size={18} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{customer.customerName}</p>
                          <p className="text-xs text-gray-500">{customer.customerEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-400">{customer.orders.length} commande{customer.orders.length > 1 ? 's' : ''}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">${customer.totalSpent.toFixed(2)}</p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-5 pt-0 space-y-4 border-t border-gray-100 dark:border-white/5">
                        <div className="sm:hidden flex justify-between text-xs text-gray-500 pt-4">
                          <span>{customer.orders.length} commande{customer.orders.length > 1 ? 's' : ''}</span>
                          <span className="font-bold text-gray-900 dark:text-white">${customer.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="space-y-4 pt-4">
                          {customer.orders.map(order => renderOrderCard(order))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      )}

      {filteredSales.length > 0 && (
        <Pagination
          page={page}
          totalItems={totalTopLevel}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel={viewMode === 'day' ? 'jours' : 'clients'}
        />
      )}
    </div>
  );
};
