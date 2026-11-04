import { create } from 'zustand';
import { MenuItem, OrderType, Paise } from '@bitechez/shared-types';
import { calculateCart, CartCalculationResult } from '@bitechez/business-logic';

export interface CartItemEntry {
  item: MenuItem;
  quantity: number;
  variantId?: string;
  variantName?: string;
  notes?: string;
}

interface CartState {
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  guestCount: number;
  items: CartItemEntry[];
  discountPercentage: number;
  flatDiscountPaise: Paise;
  discountReason?: string;

  // Actions
  setOrderType: (type: OrderType) => void;
  setTable: (tableId?: string, tableName?: string) => void;
  setGuestCount: (count: number) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  setItemNotes: (itemId: string, notes: string) => void;
  setDiscount: (percent: number, flatPaise?: Paise, reason?: string) => void;
  clearCart: () => void;

  // Computed
  getCalculations: () => CartCalculationResult;
}

export const useCartStore = create<CartState>((set, get) => ({
  orderType: 'dine_in',
  guestCount: 2,
  items: [],
  discountPercentage: 0,
  flatDiscountPaise: 0,

  setOrderType: (type) => set({ orderType: type }),
  setTable: (tableId, tableName) => set({ tableId, tableName }),
  setGuestCount: (guestCount) => set({ guestCount }),

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.item.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { item, quantity: 1 }] };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({ items: state.items.filter((i) => i.item.id !== itemId) }));
  },

  updateQuantity: (itemId, delta) => {
    set((state) => ({
      items: state.items
        .map((i) => {
          if (i.item.id === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItemEntry[],
    }));
  },

  setItemNotes: (itemId, notes) => {
    set((state) => ({
      items: state.items.map((i) => (i.item.id === itemId ? { ...i, notes } : i)),
    }));
  },

  setDiscount: (discountPercentage, flatDiscountPaise = 0, discountReason) => {
    set({ discountPercentage, flatDiscountPaise, discountReason });
  },

  clearCart: () => {
    set({
      items: [],
      discountPercentage: 0,
      flatDiscountPaise: 0,
      discountReason: undefined,
      tableId: undefined,
      tableName: undefined,
    });
  },

  getCalculations: () => {
    const state = get();
    return calculateCart({
      items: state.items.map((entry) => ({
        unitPricePaise: entry.item.basePricePaise,
        quantity: entry.quantity,
        gstRate: entry.item.gstRate,
      })),
      discountPercentage: state.discountPercentage,
      flatDiscountPaise: state.flatDiscountPaise,
      applyRounding: true,
    });
  },
}));
