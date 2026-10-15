const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error(
    "Configure EXPO_PUBLIC_API_BASE_URL in .env file"
  );
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `API error (${response.status}): ${errorBody}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}