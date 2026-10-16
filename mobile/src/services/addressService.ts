import { apiFetch } from "./api";

export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
  is_default: boolean;
}

export type CreateAddressData = Omit<Address, "id">;

export async function getAddresses(): Promise<Address[]> {
  const response = await apiFetch<
    Address[] | { results: Address[] }
  >("addresses/");

  return Array.isArray(response)
    ? response
    : response.results;
}

export async function createAddress(
  data: CreateAddressData
): Promise<Address> {
  return apiFetch<Address>("addresses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}