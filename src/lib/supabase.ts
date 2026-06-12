/**
 * DEPRECATED — do NOT import this file.
 *
 * The frontend does NOT connect to Supabase directly.
 * All services talk exclusively to VITE_DJANGO_API_BASE_URL (Django backend).
 * Authentication is managed via /auth/login, /auth/signup, /auth/logout, /auth/refresh.
 *
 * Tokens are stored in localStorage under:
 *   korra_access_token
 *   korra_refresh_token
 */
export {};
