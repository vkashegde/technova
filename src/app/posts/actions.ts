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


