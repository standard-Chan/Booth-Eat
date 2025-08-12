// src/store/orderIdsSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * 상태 구조
 * {
 *   idsByTable: {
 *     [tableId]: [orderId1, orderId2, ...]
 *   }
 * }
 */
const orderIdsSlice = createSlice({
  name: "orderIds",
  initialState: {
    idsByTable: {},
  },
  reducers: {
    addOrderId: (state, action) => {
      const { tableId, orderId } = action.payload;
      if (tableId == null || orderId == null) return;

      const key = String(tableId);
      const arr = state.idsByTable[key] || [];
      // 중복 방지
      if (!arr.includes(orderId)) {
        state.idsByTable[key] = [...arr, orderId];
      }
    },
    addOrderIds: (state, action) => {
      const { tableId, orderIds = [] } = action.payload;
      if (tableId == null) return;

      const key = String(tableId);
      const prev = state.idsByTable[key] || [];
      const set = new Set(prev);
      orderIds.forEach((id) => set.add(id));
      state.idsByTable[key] = Array.from(set);
    },
    removeOrderId: (state, action) => {
      const { tableId, orderId } = action.payload;
      const key = String(tableId);
      const prev = state.idsByTable[key] || [];
      state.idsByTable[key] = prev.filter((id) => id !== orderId);
    },
    clearTableOrders: (state, action) => {
      const { tableId } = action.payload;
      delete state.idsByTable[String(tableId)];
    },
    clearAllOrders: (state) => {
      state.idsByTable = {};
    },
  },
});

export const {
  addOrderId,
  addOrderIds,
  removeOrderId,
  clearTableOrders,
  clearAllOrders,
} = orderIdsSlice.actions;

// Selectors
export const selectOrderIdsByTable = (tableId) => (state) =>
  state.orderIds.idsByTable[String(tableId)] || [];

export const selectAllOrderIds = (state) =>
  Object.values(state.orderIds.idsByTable).flat();

export default orderIdsSlice.reducer;
