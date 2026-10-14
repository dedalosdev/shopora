export type Product = {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  category: string;
  badge?: string;
  isFeatured?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};