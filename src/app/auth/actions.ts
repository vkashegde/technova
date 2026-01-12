"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { ok: boolean; message: string };

export async function signInWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }
  redirect(next);
}

export async function signUpWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const next = String(formData.get("next") ?? "/");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // If email confirmation is enabled, user might be null until confirmed.
  if (data.user) {
    redirect(next);
  }
  return { ok: true, message: "Check your email to confirm your account." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}


