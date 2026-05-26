import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Also save to localStorage for persistence
      localStorage.setItem('sg_token', action.payload.token);
      localStorage.setItem('sg_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('sg_token');
      localStorage.removeItem('sg_user');
    },
    refreshToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      localStorage.setItem('sg_token', action.payload.token);
    },
    updateUser: (state, action: PayloadAction<{ user: any }>) => {
      state.user = action.payload.user;
      localStorage.setItem('sg_user', JSON.stringify(action.payload.user));
    },
  },
});

export const { setCredentials, logout, refreshToken, updateUser } = authSlice.actions;
export default authSlice.reducer;
