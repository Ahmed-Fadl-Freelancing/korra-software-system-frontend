import { supabase } from "./supabase";
import { toast } from "@/hooks/use-toast";

const DJANGO_API_BASE = import.meta.env.VITE_DJANGO_API_BASE_URL || "http://localhost:8000";

class ApiClient {
  private async getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  private async refreshAndGetToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) return null;
    return data.session.access_token;
  }

  async request<T = unknown>(
    path: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<T> {
    const token = await this.getToken();
    if (!token) {
      window.location.href = "/login";
      throw new Error("Not authenticated");
    }

    const res = await fetch(`${DJANGO_API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401 && !_isRetry) {
      const newToken = await this.refreshAndGetToken();
      if (newToken) {
        return this.request<T>(path, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        }, true);
      }
      await supabase.auth.signOut();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (res.status === 401) {
      await supabase.auth.signOut();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const body = await res.text();
      const errMsg = `API error ${res.status}: ${body}`;
      if (res.status !== 404) {
        toast({ title: "Request failed", description: `Error ${res.status}`, variant: "destructive" });
      }
      throw new Error(errMsg);
    }

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
