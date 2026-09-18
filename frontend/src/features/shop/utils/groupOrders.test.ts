import { describe, expect, it } from 'vitest';
import { filterSales, groupByDay, groupSalesByCustomer, groupSalesByOrder, paginate } from './groupOrders';
import type { SaleResponse } from '../types';

function sale(overrides: Partial<SaleResponse> = {}): SaleResponse {
  return {
    id: 1,
    shopId: 1,
    shopName: 'Boutique A',
    reference: 'SALE-1',
    orderReference: null,
    source: 'MANUAL',
    customerId: null,
    customerFirstname: null,
    customerLastname: null,
    customerEmail: null,
    totalAmount: 10,
    items: [],
    createdDate: '2026-01-01T10:00:00Z',
    ...overrides,
  };
}

describe('groupSalesByOrder', () => {
  it('keeps a sale without orderReference as its own group', () => {
    const sales = [sale({ id: 1, orderReference: null })];
    const groups = groupSalesByOrder(sales);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('sale-1');
  });

  it('merges sales sharing the same orderReference across shops into one group', () => {
    const sales = [
      sale({ id: 1, shopId: 10, orderReference: 'ORD-1', totalAmount: 20, items: [{ id: 1, stockItemId: 1, stockItemName: 'A', unitPrice: 20, quantity: 1, status: 'CONFIRMED' }] }),
      sale({ id: 2, shopId: 20, orderReference: 'ORD-1', totalAmount: 15, items: [{ id: 2, stockItemId: 2, stockItemName: 'B', unitPrice: 15, quantity: 1, status: 'CONFIRMED' }] }),
    ];

    const groups = groupSalesByOrder(sales);

    expect(groups).toHaveLength(1);
    expect(groups[0].totalAmount).toBe(35);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[0].items[0].shopId).toBe(10);
    expect(groups[0].items[1].shopId).toBe(20);
  });

  it('keeps the earliest createdDate when merging sales', () => {
    const sales = [
      sale({ id: 1, orderReference: 'ORD-1', createdDate: '2026-01-02T00:00:00Z' }),
      sale({ id: 2, orderReference: 'ORD-1', createdDate: '2026-01-01T00:00:00Z' }),
    ];

    const groups = groupSalesByOrder(sales);

    expect(groups[0].createdDate).toBe('2026-01-01T00:00:00Z');
  });

  it('sorts groups by createdDate descending', () => {
    const sales = [
      sale({ id: 1, orderReference: 'ORD-OLD', createdDate: '2026-01-01T00:00:00Z' }),
      sale({ id: 2, orderReference: 'ORD-NEW', createdDate: '2026-01-05T00:00:00Z' }),
    ];

    const groups = groupSalesByOrder(sales);

    expect(groups[0].orderReference).toBe('ORD-NEW');
    expect(groups[1].orderReference).toBe('ORD-OLD');
  });
});

describe('groupByDay', () => {
  it('labels today\'s entries as "Aujourd\'hui"', () => {
    const now = new Date();
    const entries = [{ createdDate: now.toISOString() }];

    const groups = groupByDay(entries);

    expect(groups[0].label).toBe("Aujourd'hui");
  });

  it('labels yesterday\'s entries as "Hier"', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const entries = [{ createdDate: yesterday.toISOString() }];

    const groups = groupByDay(entries);

    expect(groups[0].label).toBe('Hier');
  });

  it('groups multiple entries from the same day together', () => {
    const entries = [
      { createdDate: '2026-01-01T08:00:00Z' },
      { createdDate: '2026-01-01T20:00:00Z' },
    ];

    const groups = groupByDay(entries);

    expect(groups).toHaveLength(1);
    expect(groups[0].entries).toHaveLength(2);
  });
});

describe('groupSalesByCustomer', () => {
  it('groups sales by customerId and sums totalSpent', () => {
    const sales = [
      sale({ id: 1, customerId: 'c1', customerFirstname: 'Paul', customerLastname: 'Client', totalAmount: 10 }),
      sale({ id: 2, customerId: 'c1', orderReference: 'ORD-2', customerFirstname: 'Paul', customerLastname: 'Client', totalAmount: 20 }),
    ];

    const groups = groupSalesByCustomer(sales);

    expect(groups).toHaveLength(1);
    expect(groups[0].customerName).toBe('Paul Client');
    expect(groups[0].totalSpent).toBe(30);
  });

  it('falls back to "Client inconnu" when no name is provided', () => {
    const sales = [sale({ customerId: 'c1', customerFirstname: null, customerLastname: null })];

    const groups = groupSalesByCustomer(sales);

    expect(groups[0].customerName).toBe('Client inconnu');
  });

  it('groups sales without a customerId under "unknown"', () => {
    const sales = [sale({ customerId: null })];

    const groups = groupSalesByCustomer(sales);

    expect(groups[0].customerId).toBe('unknown');
  });
});

describe('filterSales', () => {
  const sales = [
    sale({ id: 1, customerFirstname: 'Paul', customerLastname: 'Client', customerEmail: 'paul@kshop.com', orderReference: 'ORD-1', items: [{ id: 1, stockItemId: 1, stockItemName: 'Keyboard', unitPrice: 10, quantity: 1, status: 'PENDING' }] }),
    sale({ id: 2, customerFirstname: 'Sophie', customerLastname: 'Gerante', customerEmail: 'sophie@kshop.com', orderReference: 'ORD-2', items: [{ id: 2, stockItemId: 2, stockItemName: 'Mouse', unitPrice: 5, quantity: 1, status: 'DELIVERED' }] }),
  ];

  it('with an empty query and ALL status returns every sale', () => {
    expect(filterSales(sales, '', 'ALL')).toHaveLength(2);
  });

  it('filters by customer name (case-insensitive)', () => {
    const result = filterSales(sales, 'paul', 'ALL');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by product name', () => {
    const result = filterSales(sales, 'mouse', 'ALL');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by order reference', () => {
    const result = filterSales(sales, 'ORD-2', 'ALL');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by status, keeping a sale if at least one line matches', () => {
    const result = filterSales(sales, '', 'DELIVERED');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('combines query and status filters', () => {
    const result = filterSales(sales, 'paul', 'DELIVERED');
    expect(result).toHaveLength(0);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5];

  it('returns the first page', () => {
    expect(paginate(items, 1, 2)).toEqual([1, 2]);
  });

  it('returns the last partial page', () => {
    expect(paginate(items, 3, 2)).toEqual([5]);
  });

  it('returns an empty array past the last page', () => {
    expect(paginate(items, 10, 2)).toEqual([]);
  });
});
