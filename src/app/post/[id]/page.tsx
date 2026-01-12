import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Hash } from "lucide-react";
import type { JSONContent } from "@tiptap/core";

import { FreeReadGate } from "@/components/access/free-read-gate";
import { RichTextViewer } from "@/components/editor/rich-text-viewer";
import { PostComments } from "@/components/posts/post-comments";
import { PostEngagement } from "@/components/posts/post-engagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { PostWithAuthor } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import { publicPostImageUrl } from "@/lib/supabase/storage";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id,title,excerpt,content,cover_image_path,status,created_at,author:profiles(id,username,full_name,avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();
  const typedPost = post as unknown as PostWithAuthor & { content: JSONContent | null };

  const { data: tagRows } = await supabase
    .from("post_tags")
    .select("tag:tags(name)")
    .eq("post_id", id);

  const tags =
    (tagRows as unknown as Array<{ tag: { name: string } | null }> | null)
      ?.map((r) => r.tag?.name)
      .filter((x): x is string => Boolean(x)) ?? [];

  const coverUrl = publicPostImageUrl(typedPost.cover_image_path);

  const author = typedPost.author;

  const isAuthor = !!user && author?.id === user.id;

  const likeCountRes = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);
  const likeCount = likeCountRes.count ?? 0;

  const commentCountRes = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);
  const commentCount = commentCountRes.count ?? 0;

  const liked = user
    ? !!(
        await supabase
          .from("post_likes")
          .select("post_id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
      ).data
    : false;

  const bookmarked = user
    ? !!(
        await supabase
          .from("post_bookmarks")
          .select("post_id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
      ).data
    : false;

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {typedPost.title}
          </h1>
          {typedPost.excerpt ? (
            <p className="text-pretty text-muted-foreground">
              {typedPost.excerpt}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {author ? (
              <Link
                href={`/u/${author.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {author.full_name || `@${author.username}`}
              </Link>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(typedPost.created_at).toLocaleDateString()}
            </span>
          </div>
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link key={t} href={`/tags/${t}`}>
                  <Badge variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {t}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {isAuthor ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/post/${id}/edit`}>Edit</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {coverUrl ? (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-3xl border bg-muted">
          <Image
            src={coverUrl}
            alt="Cover image"
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <Separator className="my-8" />

      <FreeReadGate postId={id} isAuthed={!!user} freeLimit={3}>
        <div className="grid gap-4">
          <RichTextViewer content={typedPost.content} />
        </div>

        <Separator className="my-8" />

        <PostEngagement
          postId={id}
          likeCount={likeCount}
          commentCount={commentCount}
          liked={liked}
          bookmarked={bookmarked}
          canInteract={!!user}
        />

        <PostComments postId={id} />
      </FreeReadGate>
    </article>
  );
}


