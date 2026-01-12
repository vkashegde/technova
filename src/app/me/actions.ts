"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { ok: boolean; message: string };

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Not signed in." };

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      bio: bio || null,
    })
    .eq("id", user.id)
    .select("username")
    .single();

  if (error) return { ok: false, message: error.message };

  revalidatePath("/me");
  if (updated?.username) revalidatePath(`/u/${updated.username}`);
  return { ok: true, message: "Profile updated." };
}


