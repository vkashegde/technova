import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const serverSchema = clientSchema.extend({
  // Optional but recommended for server-side admin actions (NOT exposed to client).
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
});

function readEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    // Keep error readable in dev logs.
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = readEnv();
export type ClientEnv = z.infer<typeof clientSchema>;


