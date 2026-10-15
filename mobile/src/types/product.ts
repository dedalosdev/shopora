export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image: string | null;
  category: number | null;
  stock?: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  position: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: string;
  compare_at_price: string | null;
  is_active: boolean;
}

export interface ApiProduct {
  id: number;
  category: number;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiProduct[];
}