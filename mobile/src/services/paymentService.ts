import { apiFetch } from "./api";

export type PaymentMethod = "pix" | "credit_card";

export interface CreatePaymentData {
  order_id: number;
  provider: "asaas";
  method: PaymentMethod;
}

export interface Payment {
  id: number;
  order: number;
  order_number: string;
  provider: "asaas";
  external_id: string | null;
  method: PaymentMethod;
  amount: string;
  status: string;
  checkout_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentResponse {
  message: string;
  payment: Payment;
}

export async function createPayment(
  data: CreatePaymentData
): Promise<CreatePaymentResponse> {
  return apiFetch<CreatePaymentResponse>("payments/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}