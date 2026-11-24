import { PaginationMeta } from "@/types/task";

// On the server an internal API_URL may be used (e.g. inside Docker); the browser always uses NEXT_PUBLIC_API_URL.
const BASE_URL =
  (typeof window === "undefined" ? process.env.API_URL : undefined) ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: FieldError[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
}

// Single place for base URL, headers, network errors and error-envelope parsing.
export async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store", // never serve stale task data from Next's fetch cache
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return { data: undefined as T };

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, "Received an unexpected response from the server.");
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.error?.message ?? "Request failed", json?.error?.details);
  }
  return { data: json.data as T, meta: json.meta };
}
