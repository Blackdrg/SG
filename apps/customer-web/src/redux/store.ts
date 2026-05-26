import { configureStore } from '@reduxjs/toolkit';
// @ts-ignore
import authReducer from './slices/authSlice';
// @ts-ignore
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
