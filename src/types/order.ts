import type cart = require("./cart");

export type AccountInfo = { bank: string; account: string; holder: string };
export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Order = {
  id: string;
  boothId: string;
  lines: cart.CartLine[];
  total: number;
  status: OrderStatus;
  account?: AccountInfo;
};