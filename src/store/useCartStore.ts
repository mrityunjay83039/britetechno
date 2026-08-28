import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE_SIZE';
  color: string;
  quantity: number;
  sku: string;
  stock: number;
}

export interface AppliedPromo {
  code: string;
  discountType: 'percentage' | 'fixedAmount';
  discountValue: number;
  discountAmount: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedPromo: AppliedPromo | null;
  setIsOpen: (isOpen: boolean) => void;
  setAppliedPromo: (promo: AppliedPromo | null) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      appliedPromo: null,
      setIsOpen: (isOpen) => set({ isOpen }),
      setAppliedPromo: (appliedPromo) => set({ appliedPromo }),
      addToCart: (item, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color
          );

          const newItems = [...state.items];

          if (existingIndex > -1) {
            const currentItem = state.items[existingIndex];
            const updatedQuantity = Math.min(
              currentItem.quantity + quantity,
              item.stock
            );
            newItems[existingIndex] = {
              ...currentItem,
              quantity: updatedQuantity,
            };
          } else {
            const initialQuantity = Math.min(quantity, item.stock);
            newItems.push({
              ...item,
              quantity: initialQuantity,
            });
          }

          // Open drawer on successful add to cart for better UX
          return { items: newItems, isOpen: true };
        }),
      removeFromCart: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.size === size &&
                i.color === color
              )
          ),
        })),
      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (
              i.productId === productId &&
              i.size === size &&
              i.color === color
            ) {
              const clampedQty = Math.max(1, Math.min(quantity, i.stock));
              return { ...i, quantity: clampedQty };
            }
            return i;
          }),
        })),
      clearCart: () => set({ items: [], appliedPromo: null }),
    }),
    {
      name: 'bhavatsyam-cart-storage',
      skipHydration: true,
    }
  )
);
