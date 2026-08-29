import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteListItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  wattage?: string;
  cct?: string;
  quantity: number;
  sku: string;
  stock: number;
}

export interface QuoteListState {
  items: QuoteListItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToQuoteList: (item: Omit<QuoteListItem, 'quantity'>, quantity?: number) => void;
  removeFromQuoteList: (productId: string, wattage?: string, cct?: string) => void;
  updateQuantity: (productId: string, wattage: string | undefined, cct: string | undefined, quantity: number) => void;
  clearQuoteList: () => void;
}

export const useQuoteListStore = create<QuoteListState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addToQuoteList: (item, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              (i.wattage || '') === (item.wattage || '') &&
              (i.cct || '') === (item.cct || '')
          );

          const newItems = [...state.items];

          if (existingIndex > -1) {
            const currentItem = state.items[existingIndex];
            const updatedQuantity = Math.min(
              currentItem.quantity + quantity,
              item.stock > 0 ? item.stock : 999
            );
            newItems[existingIndex] = {
              ...currentItem,
              quantity: updatedQuantity,
            };
          } else {
            const initialQuantity = Math.min(quantity, item.stock > 0 ? item.stock : 999);
            newItems.push({
              ...item,
              quantity: initialQuantity,
            });
          }

          return { items: newItems, isOpen: true };
        }),
      removeFromQuoteList: (productId, wattage = '', cct = '') =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.wattage || '') === wattage &&
                (i.cct || '') === cct
              )
          ),
        })),
      updateQuantity: (productId, wattage = '', cct = '', quantity) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (
              i.productId === productId &&
              (i.wattage || '') === wattage &&
              (i.cct || '') === cct
            ) {
              const maxStock = i.stock > 0 ? i.stock : 999;
              const clampedQty = Math.max(1, Math.min(quantity, maxStock));
              return { ...i, quantity: clampedQty };
            }
            return i;
          }),
        })),
      clearQuoteList: () => set({ items: [] }),
    }),
    {
      name: 'brite-quote-list-storage',
      skipHydration: true,
    }
  )
);
