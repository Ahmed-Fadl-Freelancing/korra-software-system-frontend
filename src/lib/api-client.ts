const API_BASE = import.meta.env.VITE_DJANGO_API_BASE_URL || "http://localhost:8000";

export const TOKEN_KEYS = {
  ACCESS: "korra_access_token",
  REFRESH: "korra_refresh_token",
} as const;

class ApiClient {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS);
  }

  setTokens(access: string, refresh?: string) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    if (refresh) localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
  }

  clearTokens() {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  }

  private async tryRefresh(): Promise<boolean> {
    const refresh = localStorage.getItem(TOKEN_KEYS.REFRESH);
    if (!refresh) return false;
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
        window.location.href = "/login";
        throw new Error("Not authenticated");
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Auto-refresh on 401 (once)
    if (res.status === 401 && !isAuthPath && _retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(path, options, false);
      this.clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (res.status === 401) {
      this.clearTokens();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      let message = `Something went wrong (${res.status})`;
      try {
        const body = await res.json();
        message = body.detail ?? body.message ?? body.error ?? message;
      } catch {
        // body wasn't JSON — keep the generic message
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
