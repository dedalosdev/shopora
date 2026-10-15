import { apiFetch } from "./api";
import { Product } from "@/types/product";

export interface PaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export async function getProducts(): Promise<Product[]> {
  const data = await apiFetch<
    Product[] | PaginatedProducts
  >("products/");

  // Support paginated responses or sample lists.
  return Array.isArray(data) ? data : data.results;
}

export async function getProduct(
  id: number
): Promise<Product> {
  return apiFetch<Product>(`products/${id}/`);
}