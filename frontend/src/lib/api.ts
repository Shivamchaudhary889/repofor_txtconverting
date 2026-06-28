// Centralised API base URL.
// On Replit the api-server is reachable at /api (artifact preview path).
// Locally, Vite proxies /api → http://localhost:8080 (see vite.config.ts).
// You can override with VITE_API_URL in .env if your backend is on a different host/port.
const RAW = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_URL = RAW && RAW.length > 0 ? RAW.replace(/\/$/, "") : "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

export const apiGet = <T,>(path: string) => apiFetch<T>(path);
export const apiPost = <T,>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
