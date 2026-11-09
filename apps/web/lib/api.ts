export const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiBase + path, {
      method,
      credentials: "include", // the session lives in an httpOnly cookie
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      message = (await res.json()).error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    // Session expired mid-use: send the person to sign in and bring them back afterwards.
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/auth/")) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  get: <T,>(path: string) => request<T>("GET", path),
  post: <T,>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  del: (path: string, body?: unknown) => request<void>("DELETE", path, body),
};

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");
