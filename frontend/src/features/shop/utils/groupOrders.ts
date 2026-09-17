import type { SaleResponse, SaleItemResponse, SaleItemStatus } from '../types';

// Une commande passée sur plusieurs boutiques en une fois crée une Sale par boutique
// côté backend (même orderReference, shopId différent) — ce regroupement les réunit en
// une seule "commande" pour l'affichage, chaque ligne gardant trace de sa boutique
// d'origine et de son statut individuel.
export interface GroupedOrderItem extends SaleItemResponse {
  saleId: number;
  shopId: number;
  shopName?: string | null;
}

export interface GroupedOrder {
  key: string;
  orderReference: string | null;
  createdDate: string;
  totalAmount: number;
  items: GroupedOrderItem[];
}

export function groupSalesByOrder(sales: SaleResponse[]): GroupedOrder[] {
  const groups = new Map<string, GroupedOrder>();

  for (const sale of sales) {
    // Une vente MANUAL (ou une ancienne donnée sans orderReference) reste son propre
    // groupe — seules les ventes ONLINE partageant le même orderReference fusionnent.
    const key = sale.orderReference ?? `sale-${sale.id}`;
    const existing = groups.get(key);

    const items: GroupedOrderItem[] = sale.items.map(item => ({
      ...item,
      saleId: sale.id,
      shopId: sale.shopId,
      shopName: sale.shopName,
    }));

    if (existing) {
      existing.items.push(...items);
      existing.totalAmount += sale.totalAmount;
      if (new Date(sale.createdDate) < new Date(existing.createdDate)) {
        existing.createdDate = sale.createdDate;
      }
    } else {
      groups.set(key, {
        key,
        orderReference: sale.orderReference,
        createdDate: sale.createdDate,
        totalAmount: sale.totalAmount,
        items,
      });
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );
}

// Regroupement par jour ("Aujourd'hui", "Hier", ou date) pour la vue gérante.
export interface DayGroup<T> {
  label: string;
  entries: T[];
}

export function groupByDay<T extends { createdDate: string }>(entries: T[]): DayGroup<T>[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const buckets = new Map<string, T[]>();
  const labels = new Map<string, string>();

  for (const entry of entries) {
    const date = new Date(entry.createdDate);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayKey = dayStart.toISOString();

    let label: string;
    if (dayStart.getTime() === today.getTime()) {
      label = "Aujourd'hui";
    } else if (dayStart.getTime() === yesterday.getTime()) {
      label = 'Hier';
    } else {
      label = dayStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    labels.set(dayKey, label);
    if (!buckets.has(dayKey)) buckets.set(dayKey, []);
    buckets.get(dayKey)!.push(entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([dayKey, dayEntries]) => ({ label: labels.get(dayKey)!, entries: dayEntries }));
}

// Regroupement par client pour la vue gérante : chaque client apparaît une fois, avec
// toutes ses commandes (elles-mêmes déjà fusionnées par orderReference via groupSalesByOrder).
export interface CustomerGroup {
  customerId: string;
  customerName: string;
  customerEmail: string;
  orders: GroupedOrder[];
  totalSpent: number;
  lastOrderDate: string;
}

export function groupSalesByCustomer(sales: SaleResponse[]): CustomerGroup[] {
  const byCustomer = new Map<string, SaleResponse[]>();
  for (const sale of sales) {
    const key = sale.customerId ?? 'unknown';
    if (!byCustomer.has(key)) byCustomer.set(key, []);
    byCustomer.get(key)!.push(sale);
  }

  return Array.from(byCustomer.entries())
    .map(([customerId, customerSales]) => {
      const orders = groupSalesByOrder(customerSales);
      const first = customerSales[0];
      return {
        customerId,
        customerName: `${first.customerFirstname ?? ''} ${first.customerLastname ?? ''}`.trim() || 'Client inconnu',
        customerEmail: first.customerEmail ?? '',
        orders,
        totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        lastOrderDate: orders[0]?.createdDate ?? first.createdDate,
      };
    })
    .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
}

// Recherche (client, référence de commande, produit) + filtre par statut, appliqués
// avant tout regroupement (jour ou client). Le filtre statut retient une commande si
// AU MOINS une de ses lignes correspond.
export function filterSales(sales: SaleResponse[], query: string, statusFilter: SaleItemStatus | 'ALL'): SaleResponse[] {
  const q = query.trim().toLowerCase();
  return sales.filter(sale => {
    if (statusFilter !== 'ALL' && !sale.items.some(item => item.status === statusFilter)) {
      return false;
    }
    if (!q) return true;
    const customerName = `${sale.customerFirstname ?? ''} ${sale.customerLastname ?? ''}`.toLowerCase();
    return (
      customerName.includes(q) ||
      (sale.customerEmail ?? '').toLowerCase().includes(q) ||
      (sale.orderReference ?? '').toLowerCase().includes(q) ||
      sale.items.some(item => item.stockItemName.toLowerCase().includes(q))
    );
  });
}

// Pagination générique côté client.
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
