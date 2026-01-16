import Image from "next/image";
import Link from "next/link";
import { Calendar, Hash } from "lucide-react";
import type { JSONContent } from "@tiptap/core";

import { FreeReadGate } from "@/components/access/free-read-gate";
import { RichTextViewer } from "@/components/editor/rich-text-viewer";
import { PostComments } from "@/components/posts/post-comments";
import { PostEngagement } from "@/components/posts/post-engagement";
import { PostCard } from "@/components/posts/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PostWithAuthor } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import { publicPostImageUrl } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

type RelatedPostRow = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_path: string | null;
  created_at: string;
  author_username: string;
  author_full_name: string | null;
  shared_tags: number;
  tags: string[];
};

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

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      "id,title,excerpt,content,cover_image_path,status,created_at,author:profiles!posts_author_id_fkey(id,username,full_name,avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Post not available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This post may be <span className="text-foreground">private</span>, a{" "}
              <span className="text-foreground">draft</span>, or it may have been deleted.
            </p>
            {user ? (
              <p>
                You’re signed in as{" "}
                <span className="text-foreground">{user.email}</span>, but you don’t have
                access to this post (it may belong to a different account).
              </p>
            ) : null}
            {user ? (
              <p className="text-xs">
                Your user id: <span className="font-mono text-foreground">{user.id}</span>
              </p>
            ) : null}
            {postError ? (
              <p className="text-xs">
                Debug: <span className="font-mono">{postError.message}</span>
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">Back to feed</Link>
              </Button>
              {user ? (
                <Button asChild className="rounded-full">
                  <Link href="/me">Go to your profile</Link>
                </Button>
              ) : (
                <Button asChild className="rounded-full">
                  <Link href={`/auth/sign-in?next=/post/${id}`}>Sign in to view</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const typedPost = post as unknown as PostWithAuthor & { content: JSONContent | null };

  // Record view (used for trending). Best-effort.
  try {
    await supabase.rpc("record_post_view", { p_post_id: id });
  } catch {
    // ignore
  }

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

  const relatedRes = await supabase.rpc("get_related_posts", {
    p_post_id: id,
    limit_count: 6,
  });
  const related = (relatedRes.data ?? []) as unknown as RelatedPostRow[];

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

      {related.length ? (
        <>
          <Separator className="my-8" />
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">Related posts</h2>
              {tags[0] ? (
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/search?tag=${encodeURIComponent(tags[0])}`}>
                    Explore more
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {related.map((p) => (
                <PostCard
                  key={p.id}
                  post={{
                    id: p.id,
                    title: p.title,
                    excerpt: p.excerpt,
                    cover_image_path: p.cover_image_path,
                    created_at: p.created_at,
                    author: { username: p.author_username, full_name: p.author_full_name },
                    tags: p.tags ?? [],
                  }}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </article>
  );
}


