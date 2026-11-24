import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "../config";
import { createLocalRepository, type KeyValueStorage } from "../data/localRepository";
import type { TodoRepository } from "../data/repository";
import { createSupabaseRepository } from "../data/supabaseRepository";

export interface AppServices {
  /** Null in local mode, where no sign-in is required. */
  supabase: SupabaseClient | null;
  repository: TodoRepository;
}

/** Storage that falls back to memory when the browser blocks localStorage (private mode etc.). */
function browserStorage(): KeyValueStorage {
  const memory = new Map<string, string>();
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
    },
  };
}

export function createServices(env: Record<string, string | undefined>): AppServices {
  const config = readSupabaseConfig(env);
  if (!config) {
    return { supabase: null, repository: createLocalRepository(browserStorage()) };
  }
  const supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return { supabase, repository: createSupabaseRepository(supabase) };
}
