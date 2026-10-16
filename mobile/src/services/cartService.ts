import { apiFetch } from "./api";

export interface BackendCartItem {
  id: number;
  variant: number;
  quantity: number;
}

export async function addItemToBackendCart(
  variantId: number,
  quantity: number
): Promise<BackendCartItem> {
  return apiFetch<BackendCartItem>("cart/items/", {
    method: "POST",
    body: JSON.stringify({
      variant: variantId,
      quantity,
    }),
  });
}