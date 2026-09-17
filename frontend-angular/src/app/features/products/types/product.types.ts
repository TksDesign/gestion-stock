export interface Product {
  id: number;
  name: string;
  description: string;
  availableQuantity: number;
  price: number;
  shopId?: number | null;
  shopName?: string | null;
  categoryName?: string | null;
}

export interface ProductPurchaseRequest {
  productId: number;
  quantity: number;
}

export interface ProductPurchaseResponse {
  productId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}
