import { ApiProduct, ProductVariant } from "../types/product";

export type ShoporaProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  rating: string;
  image: string;
  description: string;
  isFeatured: boolean;
  variants: ProductVariant[];
};


const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

function resolveImageUrl(image: string): string {
  if (!image) {
    return "";
  }

  try {
    const imageUrl = new URL(image);
    const apiUrl = new URL(API_URL);

    if (
      imageUrl.hostname === "127.0.0.1" ||
      imageUrl.hostname === "localhost"
    ) {
      imageUrl.protocol = apiUrl.protocol;
      imageUrl.hostname = apiUrl.hostname;
      imageUrl.port = apiUrl.port;
    }

    return imageUrl.toString();
  } catch {
    return image;
  }
}

export function adaptProduct(
  product: ApiProduct
): ShoporaProduct {
    const activeVariants = product.variants.filter(
      (variant) => variant.is_active
    );

    const firstVariant = activeVariants[0];

    return {
      id: String(product.id),
      name: product.name,
      category: product.category_name,
      price: Number(firstVariant?.price ?? 0),
      compareAtPrice: firstVariant?.compare_at_price
        ? Number(firstVariant.compare_at_price)
        : null,
      rating: "5.0",
      image: resolveImageUrl(
        product.images?.[0]?.image ?? ""
      ),
      description: product.description,
      isFeatured: product.is_featured,
      variants: activeVariants,
    };
}
