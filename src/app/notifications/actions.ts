"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type NotificationActionState = { ok: boolean; message: string };

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Not signed in." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/");
  revalidatePath("/me");
  return { ok: true, message: "Marked all as read." };
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Not signed in." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/");
  revalidatePath("/me");
  return { ok: true, message: "" };
}


