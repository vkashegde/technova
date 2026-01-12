import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { CommentRow } from "@/lib/db/types";

export async function PostComments({ postId }: { postId: string }) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("comments")
    .select("id,body,created_at,author:profiles!comments_author_id_fkey(username,full_name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(50);
  const comments = (data ?? []) as unknown as CommentRow[];

  if (!comments?.length) {
    return (
      <div className="mt-8 rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        No comments yet. Be the first to start the discussion.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" />
        Comments
      </div>
      {comments.map((c) => {
        const author = Array.isArray(c.author) ? c.author[0] ?? null : c.author;
        return (
        <Card key={c.id} className="rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            {author ? (
              <Link
                href={`/u/${author.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {author.full_name || `@${author.username}`}
              </Link>
            ) : (
              <span>Unknown</span>
            )}
            <span>{new Date(c.created_at).toLocaleString()}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
        </Card>
        );
      })}
    </div>
  );
}


