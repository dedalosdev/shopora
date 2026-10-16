import { apiFetch } from "./api";
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "./tokenStorage";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

export async function login(
  credentials: LoginCredentials
): Promise<AuthTokens> {
  const tokens = await apiFetch<AuthTokens>("auth/token/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  await saveTokens(tokens.access, tokens.refresh);

  return tokens;
}

export async function register(data: RegisterData) {
  return apiFetch("auth/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getStoredAccessToken(): Promise<
  string | null
> {
  return getAccessToken();
}

export async function getStoredRefreshToken(): Promise<
  string | null
> {
  return getRefreshToken();
}

export async function isAuthenticated(): Promise<boolean> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  return Boolean(accessToken || refreshToken);
}

export async function logout(): Promise<void> {
  await clearTokens();
}