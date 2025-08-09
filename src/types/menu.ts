export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'FOOD'|'DRINK';
  imageUrl: string;
  soldOut?: boolean;
};