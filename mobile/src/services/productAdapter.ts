import { Product as ApiProduct } from "@/types/product";


export interface ShoporaProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  image: string;
  description: string;
}

export function adaptProduct(
  product: ApiProduct
): ShoporaProduct {
  return {
    id: String(product.id),
    name: product.name,
    category: String(product.category ?? "Others"),
    price: Number(product.price),
    rating: "—",
    image: product.image ?? "",
    description: product.description ?? "",
  };
}