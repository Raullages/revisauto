import { Capacitor } from "@capacitor/core";
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { nativeStorage } from "./native-storage";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  browserClient = Capacitor.isNativePlatform()
    ? createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
          storage: nativeStorage,
        },
      })
    : createBrowserClient<Database>(supabaseUrl, supabaseKey);

  return browserClient;
}
