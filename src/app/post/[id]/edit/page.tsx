import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import { PostEditorForm } from "@/components/posts/post-editor-form";
import { deletePostAction } from "@/app/posts/actions";
import { Button } from "@/components/ui/button";
import type { PostRow } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: post } = await supabase
    .from("posts")
    .select("id,title,excerpt,content,cover_image_path,status,author_id")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();
  const typedPost = post as unknown as Pick<
    PostRow,
    "id" | "title" | "excerpt" | "content" | "cover_image_path" | "status" | "author_id"
  >;
  if (typedPost.author_id !== user.id) notFound();

  const { data: tagRows } = await supabase
    .from("post_tags")
    .select("tag:tags(name)")
    .eq("post_id", id);

  const tags =
    (tagRows as unknown as Array<{ tag: { name: string } | null }> | null)
      ?.map((r) => r.tag?.name)
      .filter((x): x is string => Boolean(x)) ?? [];

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={deletePostAction}>
          <input type="hidden" name="post_id" value={typedPost.id} />
          <Button type="submit" variant="destructive" className="rounded-full">
            Delete
          </Button>
        </form>
      </div>

      <PostEditorForm
        mode="edit"
        initial={{
          id: typedPost.id,
          title: typedPost.title,
          excerpt: typedPost.excerpt,
          status: typedPost.status,
          cover_image_path: typedPost.cover_image_path,
          content: (typedPost.content as JSONContent | null) ?? null,
          tags,
        }}
      />
    </div>
  );
}


