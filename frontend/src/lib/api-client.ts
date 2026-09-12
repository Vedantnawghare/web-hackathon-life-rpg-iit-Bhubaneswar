import { createClient } from "@/lib/supabase/client";
import { ApiProblemDetails } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Routes that do not require an authenticated Bearer token.
 */
const PUBLIC_ENDPOINTS = ["/health"];

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(problem: ApiProblemDetails) {
    super(problem.detail || problem.title || "API Error");
    this.name = "ApiError";
    this.status = problem.status;
    this.code = problem.code || "API_ERROR";
    this.details = problem;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const isPublic = PUBLIC_ENDPOINTS.some(
    (p) => normalizedEndpoint === p || normalizedEndpoint.startsWith(`${p}?`)
  );

  let token: string | undefined;

  if (typeof window !== "undefined") {
    const supabase = createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn("Error reading Supabase session:", sessionError);
    }

    let session = sessionData?.session;

    // Auto-refresh token if expired or within 60 seconds of expiry
    if (session && session.expires_at) {
      const isExpiringSoon = session.expires_at * 1000 < Date.now() + 60000;
      if (isExpiringSoon) {
        try {
          const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshed?.session) {
            session = refreshed.session;
          }
        } catch (e) {
          console.warn("Failed to refresh session token:", e);
        }
      }
    }

    token = session?.access_token;
  }

  // If endpoint is protected and no token exists, cleanly raise an authentication error
  if (!isPublic && !token) {
    throw new ApiError({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
      detail: "Authentication bearer token required. Please sign in.",
      code: "MISSING_TOKEN",
    });
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let problem: ApiProblemDetails;
    try {
      problem = await response.json();
    } catch {
      problem = {
        type: "about:blank",
        title: response.statusText,
        status: response.status,
        detail: `Request failed with HTTP status ${response.status}`,
        code: "HTTP_ERROR",
      };
    }
    throw new ApiError(problem);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
