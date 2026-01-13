import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import type { CommentRow } from "@/lib/db/types";

export async function PostComments({ postId }: { postId: string }) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("comments")
    .select(
      "id,body,created_at,author:profiles!comments_author_id_fkey(username,full_name,avatar_url)",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(50);
  const comments = (data ?? []) as unknown as CommentRow[];

  if (!comments?.length) {
    return (
      <div className="mt-8 rounded-3xl border bg-muted/30 p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <MessageCircle className="h-4 w-4" />
          Comments
        </div>
        <p className="mt-2">No comments yet. Be the first to start the discussion.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" />
          Comments
        </div>
        <div className="text-xs text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </div>
      </div>
      {comments.map((c) => {
        const author = Array.isArray(c.author) ? c.author[0] ?? null : c.author;
        const authorName = author?.full_name || (author?.username ? `@${author.username}` : "Unknown");
        const avatarFallback = (author?.username ?? authorName ?? "U").slice(0, 2).toUpperCase();
        return (
          <div
            key={c.id}
            className="flex items-start gap-3 rounded-3xl border bg-muted/20 p-4 shadow-sm transition hover:bg-muted/30"
          >
            <Avatar className="mt-0.5 h-10 w-10">
              <AvatarImage src={author?.avatar_url ?? undefined} alt={authorName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                {author?.username ? (
                  <Link
                    href={`/u/${author.username}`}
                    className="truncate text-sm font-semibold text-foreground hover:underline"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="truncate text-sm font-semibold text-foreground">
                    {authorName}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                {c.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


