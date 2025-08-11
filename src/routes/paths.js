// src/routes/paths.js
export const paths = {
  // customer
  menu: (boothId) => `/booths/${boothId}/menu`,
  cart: (boothId) => `/booths/${boothId}/order`,
  confirm: (boothId) => `/booths/${boothId}/order/confirm`,
  pending: (boothId, orderId) => `/booths/${boothId}/order/pending/${orderId}`,
  complete: (boothId, orderId) => `/booths/${boothId}/order/complete/${orderId}`,
  orderHistory: (boothId) => `/booths/${boothId}/orderHistory`,

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
