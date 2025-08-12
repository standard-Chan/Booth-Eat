import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice.js';
import orderIdsReducer from './orderIdsSlice.js'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    orderIds: orderIdsReducer,
  },
});
