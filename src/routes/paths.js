export const paths = {
  menu: (boothId) => `/booths/${boothId}/menu`,
  cart: (boothId) => `/booths/${boothId}/order`,
  confirm: (boothId) => `/booths/${boothId}/order/confirm`,
  pending: (boothId, orderId) => `/booths/${boothId}/order/pending/${orderId}`,
  complete: (boothId, orderId) => `/booths/${boothId}/order/complete/${orderId}`,
  orderHistory: (boothId) => `/booths/${boothId}/orderHistory`,
};