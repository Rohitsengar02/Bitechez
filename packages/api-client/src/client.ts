import { 
  Order, 
  MenuItem, 
  RestaurantTable, 
  KotTicket, 
  SyncPushBatchRequest, 
  SyncPushBatchResponse 
} from '@bitechez/shared-types';

export class BitechezApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status} (${response.statusText}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // Health
  async checkHealth(): Promise<{ status: string; uptime: number }> {
    return this.request('/health');
  }

  // Orders
  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getActiveOrders(outletId: string): Promise<Order[]> {
    return this.request(`/api/orders/active?outletId=${outletId}`);
  }

  // Tables
  async getTables(outletId: string): Promise<RestaurantTable[]> {
    return this.request(`/api/tables?outletId=${outletId}`);
  }

  // Menu
  async getMenu(outletId: string): Promise<MenuItem[]> {
    return this.request(`/api/menu?outletId=${outletId}`);
  }

  // KOT
  async getActiveKots(outletId: string): Promise<KotTicket[]> {
    return this.request(`/api/kots/active?outletId=${outletId}`);
  }

  // Sync
  async pushSyncBatch(batch: SyncPushBatchRequest): Promise<SyncPushBatchResponse> {
    return this.request('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  }
}
