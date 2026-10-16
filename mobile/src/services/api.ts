import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  clearTokens,
} from "./tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error(
    "Configure EXPO_PUBLIC_API_URL in .env file"
  );
}

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/auth/token/refresh/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    }
  );

  if (!response.ok) {
    await clearTokens();
    return null;
  }

  const data = (await response.json()) as {
    access: string;
  };

  await saveAccessToken(data.access);

  return data.access;
}

async function makeRequest(
  endpoint: string,
  options: ApiFetchOptions,
  accessToken?: string | null
): Promise<Response> {
  const { skipAuth, ...requestOptions } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(requestOptions.headers as Record<string, string> | undefined),
  };

  if (
    requestOptions.body &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(
    `${API_URL!.replace(/\/$/, "")}/${endpoint.replace(
      /^\//,
      ""
    )}`,
    {
      ...requestOptions,
      headers,
    }
  );
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  token?: string
): Promise<T> {
  let accessToken =
    token ?? (await getAccessToken());

  let response = await makeRequest(
    endpoint,
    options,
    accessToken
  );

  // Access token expirado.
  if (
    response.status === 401 &&
    !options.skipAuth
  ) {
    accessToken = await refreshAccessToken();

    if (accessToken) {
      response = await makeRequest(
        endpoint,
        options,
        accessToken
      );
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Erro na API (${response.status}): ${errorBody}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}