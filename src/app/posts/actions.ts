"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { normalizeTags } from "@/lib/tags";

export type PostActionState = { ok: boolean; message: string };

function parseJsonOrEmpty(value: unknown) {
  if (typeof value !== "string" || !value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function upsertTagsAndAttach(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  tagNames: string[],
) {
  if (!tagNames.length) return;

  // Create tags if missing.
  await supabase.from("tags").upsert(
    tagNames.map((name) => ({ name })),
    { onConflict: "name" },
  );

  const { data: tags } = await supabase
    .from("tags")
    .select("id,name")
    .in("name", tagNames);

  if (!tags?.length) return;

  await supabase.from("post_tags").insert(
    tags.map((t) => ({ post_id: postId, tag_id: t.id })),
  );
}

async function notifyFollowersOnPublish(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authorId: string,
  postId: string,
) {
  const { data: followerRows } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", authorId)
    .limit(5000);

  const followerIds = (followerRows as unknown as Array<{ follower_id: string }> | null)?.map(
    (r) => r.follower_id,
  ) ?? [];
  if (!followerIds.length) return;

  await supabase.from("notifications").insert(
    followerIds.map((uid) => ({
      user_id: uid,
      actor_id: authorId,
      type: "post_published",
      post_id: postId,
    })),
  );
}

export async function createPostAction(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const status = String(formData.get("status") ?? "published");
  const tags = normalizeTags(String(formData.get("tags") ?? ""));
  const coverImagePath = String(formData.get("cover_image_path") ?? "").trim();
  const content = parseJsonOrEmpty(formData.get("content"));

  if (!title) return { ok: false, message: "Title is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be signed in." };

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      excerpt: excerpt || null,
      content,
      cover_image_path: coverImagePath || null,
      status: status === "draft" ? "draft" : "published",
    })
    .select("id")
    .single();

  if (error || !post) return { ok: false, message: error?.message ?? "Failed." };

  // Attach tags
  await upsertTagsAndAttach(supabase, post.id, tags);

  if (status !== "draft") {
    await notifyFollowersOnPublish(supabase, user.id, post.id);
  }

  redirect(`/post/${post.id}`);
}

export async function updatePostAction(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const postId = String(formData.get("post_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const status = String(formData.get("status") ?? "published");
  const tags = normalizeTags(String(formData.get("tags") ?? ""));
  const coverImagePath = String(formData.get("cover_image_path") ?? "").trim();
  const content = parseJsonOrEmpty(formData.get("content"));

  if (!postId) return { ok: false, message: "Missing post id." };
  if (!title) return { ok: false, message: "Title is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "You must be signed in." };

  const { data: existing } = await supabase
    .from("posts")
    .select("status")
    .eq("id", postId)
    .maybeSingle();
  const previousStatus = (existing as unknown as { status?: string } | null)?.status;

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      excerpt: excerpt || null,
      content,
      cover_image_path: coverImagePath || null,
      status: status === "draft" ? "draft" : "published",
    })
    .eq("id", postId);

  if (error) return { ok: false, message: error.message };

  // Replace tags
  await supabase.from("post_tags").delete().eq("post_id", postId);
  await upsertTagsAndAttach(supabase, postId, tags);

  // Notify followers only on transition draft -> published
  if (previousStatus === "draft" && status !== "draft") {
    await notifyFollowersOnPublish(supabase, user.id, postId);
  }

  redirect(`/post/${postId}`);
}

export async function deletePostAction(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const supabase = await createClient();

  if (postId) {
    await supabase.from("posts").delete().eq("id", postId);
  }
  redirect("/");
}




