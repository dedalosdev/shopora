import { apiFetch } from "./api";

export interface CreateOrderData {
  address_id: number;
  coupon_code?: string;
  customer_notes?: string;
}

export interface Order {
  id: number;
  status?: string;
  total?: string | number;
  created_at?: string;
}

export async function createOrderFromCart(
  data: CreateOrderData
): Promise<Order> {
  return apiFetch<Order>(
    "orders/create-from-cart/",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}