export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Public Supabase settings read from build-time environment variables.
 * Only the publishable/anon key may be used here. Never add service-role keys to the frontend.
 * When the variables are missing the app runs in local mode, with data kept in the browser.
 */
export function readSupabaseConfig(env: Record<string, string | undefined>): SupabaseConfig | null {
  const url = env["VITE_SUPABASE_URL"]?.trim();
  const anonKey = env["VITE_SUPABASE_ANON_KEY"]?.trim();
  return url && anonKey ? { url, anonKey } : null;
}
