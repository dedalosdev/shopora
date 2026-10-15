export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image: string | null;
  category: number | null;
  stock?: number;
}