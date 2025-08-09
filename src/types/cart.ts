export type CartLine = { id: number; name: string; price: number; qty: number };
export type Cart = { lines: CartLine[]; count: number; total: number };
