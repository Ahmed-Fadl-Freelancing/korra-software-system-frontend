const API_BASE = import.meta.env.VITE_DJANGO_API_BASE_URL || "http://localhost:8000";

export const TOKEN_KEYS = {
  ACCESS: "korra_access_token",
  REFRESH: "korra_refresh_token",
} as const;

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

class ApiClient {
  getAccessToken(): string | null {
    const val = localStorage.getItem(TOKEN_KEYS.ACCESS);
    // Guard against "null" / "undefined" strings stored by accident
    if (!val || val === "null" || val === "undefined") return null;
    return val;
  }

  setTokens(access: string | null | undefined, refresh?: string | null) {
    // Only store real non-empty strings — never store null / undefined / "null"
    if (access && access !== "null" && access !== "undefined") {
      localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    }
    if (refresh && refresh !== "null" && refresh !== "undefined") {
      localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    }
  }

  clearTokens() {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  }

  private async tryRefresh(): Promise<boolean> {
    const refresh = localStorage.getItem(TOKEN_KEYS.REFRESH);
    if (!refresh || refresh === "null" || refresh === "undefined") return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  async request<T = unknown>(
    path: string,
    options: RequestInit = {},
    _retry = true
  ): Promise<T> {
    const isAuthPath = path.startsWith("/auth/");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (!isAuthPath) {
      const token = this.getAccessToken();
      if (!token) {
        // Throw — ProtectedRoute handles the redirect to /login, not us
        throw new ApiAuthError("No access token");
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Auto-refresh on 401 (once, non-auth paths only)
    if (res.status === 401 && !isAuthPath && _retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(path, options, false);
      this.clearTokens();
      throw new ApiAuthError("Session expired");
    }

    if (res.status === 401) {
      this.clearTokens();
      throw new ApiAuthError("Unauthorized");
    }

    if (!res.ok) {
      let message = `Something went wrong (${res.status})`;
      try {
        const body = await res.json();
        message = body.detail ?? body.message ?? body.error ?? message;
      } catch {
        // body wasn't JSON — keep generic message
      }
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T = unknown>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T = unknown>(path: string, data?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = unknown>(path: string, data?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = unknown>(path: string, data?: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = unknown>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  async uploadToSignedUrl(signedUrl: string, file: File): Promise<void> {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  }
}

export const apiClient = new ApiClient();
