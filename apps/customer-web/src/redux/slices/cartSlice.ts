import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: CartItem; restaurantId: string }>) => {
      if (state.restaurantId && state.restaurantId !== action.payload.restaurantId) {
        // In a real app, you might ask to clear cart
        state.items = [];
      }
      state.restaurantId = action.payload.restaurantId;
      const existingItem = state.items.find((i) => i.id === action.payload.item.id);
      if (existingItem) {
        existingItem.quantity += action.payload.item.quantity;
        // Note: we are not merging notes here. In a real app, you might want to combine or choose one.
        // For simplicity, we keep the existing note.
      } else {
        state.items.push(action.payload.item);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      if (state.items.length === 0) state.restaurantId = null;
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      if (state.items.length === 0) state.restaurantId = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
