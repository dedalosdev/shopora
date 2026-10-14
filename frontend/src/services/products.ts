import type { Product } from "../types";
import { apiRequest } from "../lib/api";

const demoProducts: Product[] = [
  {
    id: 1,
    name: "Everyday Ceramic Mug",
    slug: "everyday-ceramic-mug",
    description: "A quiet little upgrade to your daily coffee ritual.",
    price: 24,
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558facab3?auto=format&fit=crop&w=900&q=85",
    category: "Home",
    badge: "Bestseller",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Sculpted Table Lamp",
    slug: "sculpted-table-lamp",
    description: "Soft ambient light, clean lines, and a timeless silhouette.",
    price: 89,
    compareAtPrice: 110,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    category: "Home",
    badge: "Save 19%",
    isFeatured: true,
  },
  {
    id: 3,
    name: "Daily Carry Tote",
    slug: "daily-carry-tote",
    description: "An easy, durable carry-all for wherever the day takes you.",
    price: 38,
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
    category: "Accessories",
    isFeatured: true,
  },
  {
    id: 4,
    name: "Minimal Stoneware Vase",
    slug: "minimal-stoneware-vase",
    description: "A sculptural accent that looks just as good on its own.",
    price: 46,
    imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85",
    category: "Home",
  },
  {
    id: 5,
    name: "Everyday Crossbody",
    slug: "everyday-crossbody",
    description: "Thoughtful organization in a compact, versatile shape.",
    price: 64,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
    category: "Accessories",
    badge: "New",
  },
  {
    id: 6,
    name: "Linen Cushion Cover",
    slug: "linen-cushion-cover",
    description: "Natural texture and a relaxed finish for your favorite corner.",
    price: 32,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85",
    category: "Living",
  },
  {
    id: 7,
    name: "Insulated Travel Bottle",
    slug: "insulated-travel-bottle",
    description: "A dependable everyday companion, at home or on the move.",
    price: 29,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    category: "Lifestyle",
  },
  {
    id: 8,
    name: "Soft Knit Throw",
    slug: "soft-knit-throw",
    description: "An inviting layer for slower mornings and quieter evenings.",
    price: 72,
    imageUrl: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=900&q=85",
    category: "Living",
  },
];

type ApiProduct = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  compare_at_price?: string | number | null;
  image_url?: string;
  image?: string;
  category_name?: string;
  category?: string | { name?: string };
  is_featured?: boolean;
};

function mapApiProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description ?? "",
    price: Number(item.price),
    compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : undefined,
    imageUrl: item.image_url ?? item.image ?? "",
    category: typeof item.category === "string" ? item.category : item.category?.name ?? item.category_name ?? "General",
    isFeatured: item.is_featured ?? false,
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const data = await apiRequest<ApiProduct[] | { results: ApiProduct[] }>("/products/");
    const rows = Array.isArray(data) ? data : data.results;
    if (rows.length) return rows.map(mapApiProduct);
  } catch {
    // Demo data keeps the storefront usable before the backend endpoint is connected.
  }
  return demoProducts;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((product) => product.isFeatured);
  return featured.length ? featured : products.slice(0, 4);
}