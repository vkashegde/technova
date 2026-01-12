import { publicEnv } from "@/lib/env/client";

export function publicPostImageUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${path}`;
}


