import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],       // [{ foodId, name, price, imageUrl, quantity }]
  totalAmount: 0,  // 전체 금액 합
};

const recalculate = (state) => {
  state.totalAmount = state.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, { payload }) {
      // payload: { foodId, name, price, imageUrl, quantity }
      const idx = state.items.findIndex((it) => it.foodId === payload.foodId);
      if (idx >= 0) {
        state.items[idx].quantity += payload.quantity ?? 1;
      } else {
        state.items.push({
          foodId: payload.foodId,
          name: payload.name,
          price: payload.price,
          imageUrl: payload.imageUrl ?? null,
          quantity: payload.quantity ?? 1,
        });
      }
      recalculate(state);
    },
    inc(state, { payload }) { // payload: foodId
      const t = state.items.find((it) => it.foodId === payload);
      if (t) t.quantity += 1;
      recalculate(state);
    },
    dec(state, { payload }) { // payload: foodId
      const t = state.items.find((it) => it.foodId === payload);
      if (t && t.quantity > 1) t.quantity -= 1;
      recalculate(state);
    },
    removeItem(state, { payload }) { // payload: foodId
      state.items = state.items.filter((it) => it.foodId !== payload);
      recalculate(state);
    },
    clear(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addItem, inc, dec, removeItem, clear } = cartSlice.actions;
export default cartSlice.reducer;

// selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
