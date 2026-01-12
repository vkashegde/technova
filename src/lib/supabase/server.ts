import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { serverEnv } from "@/lib/env/server";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components may throw when attempting to set cookies.
            // Middleware will refresh the session cookie instead.
          }
        },
      },
    },
  );
}


