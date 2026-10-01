export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ApiOptions extends RequestInit {
  json?: unknown;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { json, headers, ...init } = options;

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
    ...init,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "API request failed";
    throw new Error(message);
  }

  return payload as T;
}
