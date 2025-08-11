// src/routes/paths.js
export const paths = {
  // customer
  menu: (boothId, tableId) => `/booths/${boothId}/tables/${tableId}/menu`,
  cart: (boothId, tableId) => `/booths/${boothId}/tables/${tableId}/order`,
  confirm: (boothId, tableId) => `/booths/${boothId}/tables/${tableId}/order/confirm`,
  pending: (boothId, tableId, orderId) => `/booths/${boothId}/tables/${tableId}/order/pending/${orderId}`,
  complete: (boothId, tableId, orderId) => `/booths/${boothId}/tables/${tableId}/order/complete/${orderId}`,
  orderHistory: (boothId, tableId) => `/booths/${boothId}/tables/${tableId}/orderHistory`,

  // manager
  manager: {
    root: () => `/manager`,
    boothRoot: (boothId) => `/manager/booths/${boothId}`,
    orders:   (boothId) => `/manager/booths/${boothId}/orders`,
    menus:    (boothId) => `/manager/booths/${boothId}/menus`,
    sales:    (boothId) => `/manager/booths/${boothId}/sales`,
    reports:  (boothId) => `/manager/booths/${boothId}/reports`,
    settings: (boothId) => `/manager/booths/${boothId}/settings`,
  },
};
