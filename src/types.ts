export interface MenuItem {
  id: string;
  name: string;
  category: 'Meals' | 'Snacks' | 'Beverages' | 'Quick Bites';
  price: number;
  prepTimeMinutes: number;
  description: string;
  isVeg: boolean;
  popular?: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  prepTimeMinutes: number;
}

export type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface TokenOrder {
  id: string;
  tokenNumber: number;
  studentName: string;
  studentId: string;
  counterNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number; // timestamp in ms
  estimatedWaitMinutes: number;
  readyAt?: number;
  completedAt?: number;
  notes?: string;
}

export interface PeakHourData {
  hour: string;
  orders: number;
  avgWait: number;
}

export interface QueueStatistics {
  avgWaitTimeMinutes: number;
  totalTokensIssued: number;
  completedOrdersCount: number;
  currentActiveQueueCount: number;
  peakHour: string;
  rushLevel: 'Low' | 'Moderate' | 'High Rush';
}
