"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SocialActionState = { ok: boolean; message: string };

export async function togglePostLikeAction(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const postId = String(formData.get("post_id") ?? "");
  if (!postId) return { ok: false, message: "Missing post id." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in to like." };

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath(`/post/${postId}`);
  return { ok: true, message: "" };
}

export async function togglePostBookmarkAction(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const postId = String(formData.get("post_id") ?? "");
  if (!postId) return { ok: false, message: "Missing post id." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in to bookmark." };

  const { data: existing } = await supabase
    .from("post_bookmarks")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("post_bookmarks")
      .insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath(`/post/${postId}`);
  return { ok: true, message: "" };
}

export async function addCommentAction(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!postId) return { ok: false, message: "Missing post id." };
  if (!body) return { ok: false, message: "Comment is empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sign in to comment." };

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    body,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/post/${postId}`);
  return { ok: true, message: "" };
}

export async function toggleFollowUserAction(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const targetId = String(formData.get("target_user_id") ?? "");
  const targetUsername = String(formData.get("target_username") ?? "");
  if (!targetId) return { ok: false, message: "Missing target user." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to follow." };
  if (user.id === targetId) return { ok: false, message: "You can't follow yourself." };

  const { data: existing } = await supabase
    .from("follows")
    .select("following_id")
    .eq("following_id", targetId)
    .eq("follower_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("following_id", targetId)
      .eq("follower_id", user.id);
  } else {
    await supabase
      .from("follows")
      .insert({ following_id: targetId, follower_id: user.id });
  }

  if (targetUsername) revalidatePath(`/u/${targetUsername}`);
  revalidatePath("/");
  return { ok: true, message: "" };
}

export async function toggleFollowTagAction(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const tagId = String(formData.get("tag_id") ?? "");
  const tagName = String(formData.get("tag_name") ?? "");
  if (!tagId) return { ok: false, message: "Missing tag." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to follow tags." };

  const { data: existing } = await supabase
    .from("tag_follows")
    .select("tag_id")
    .eq("tag_id", tagId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("tag_follows")
      .delete()
      .eq("tag_id", tagId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("tag_follows").insert({ tag_id: tagId, user_id: user.id });
  }

  if (tagName) revalidatePath(`/tags/${tagName}`);
  revalidatePath("/");
  return { ok: true, message: "" };
}


