import { z } from "zod";

// IMPORTANT: Access NEXT_PUBLIC_* directly so Next.js can inline these values in client bundles.
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid public environment variables:\n${issues}`);
}

export const publicEnv = parsed.data;


