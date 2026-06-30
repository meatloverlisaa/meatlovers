// Bar Workspace TypeScript Interfaces

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';

export type ProductCategory = 'FOOD' | 'SOFT_DRINK' | 'ALCOHOLIC_DRINK';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: ProductCategory;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
}

export interface DrinkOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  table: {
    id: string;
    tableName: string;
  };
  waiter: {
    id: string;
    fullName: string;
  };
  customer?: {
    id: string;
    name: string;
  };
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarSummary {
  pending: number;
  preparing: number;
  ready: number;
  total: number;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  timestamp: string;
  notes?: string;
}

export interface StockDeduction {
  productId: string;
  quantity: number;
  sourceOrderId: string;
}

export interface StockLevel {
  productId: string;
  productName: string;
  quantity: number;
  location: string;
}

// API Response Types
export type GetBarOrdersResponse = DrinkOrder[];
export type GetBarSummaryResponse = BarSummary;
export type GetBarTransfersResponse = StockTransfer[];

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export type UpdateOrderStatusResponse = DrinkOrder;

export interface RecordBarSaleRequest {
  productId: string;
  quantity: number;
  sourceOrderId: string;
}

export interface RecordBarSaleResponse {
  success: boolean;
  movementId: string;
  remainingStock: number;
}
