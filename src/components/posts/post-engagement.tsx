"use client";

import * as React from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { toast } from "sonner";

import {
  addCommentAction,
  togglePostBookmarkAction,
  togglePostLikeAction,
  type SocialActionState,
} from "@/app/social/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PostEngagement({
  postId,
  likeCount,
  commentCount,
  bookmarked,
  liked,
  canInteract,
}: {
  postId: string;
  likeCount: number;
  commentCount: number;
  bookmarked: boolean;
  liked: boolean;
  canInteract: boolean;
}) {
  const [likeState, likeAction, likePending] = React.useActionState<SocialActionState, FormData>(
    togglePostLikeAction,
    { ok: true, message: "" },
  );
  const [bmState, bmAction, bmPending] = React.useActionState<SocialActionState, FormData>(
    togglePostBookmarkAction,
    { ok: true, message: "" },
  );
  const [commentState, commentAction, commentPending] = React.useActionState<SocialActionState, FormData>(
    addCommentAction,
    { ok: true, message: "" },
  );

  React.useEffect(() => {
    if (likeState.message) toast.error(likeState.message);
  }, [likeState.message]);
  React.useEffect(() => {
    if (bmState.message) toast.error(bmState.message);
  }, [bmState.message]);
  React.useEffect(() => {
    if (commentState.message) toast.error(commentState.message);
  }, [commentState.message]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <form action={likeAction}>
          <input type="hidden" name="post_id" value={postId} />
          <Button
            type="submit"
            variant={liked ? "default" : "outline"}
            className="rounded-full"
            disabled={!canInteract || likePending}
          >
            <Heart className="mr-2 h-4 w-4" />
            {likeCount}
          </Button>
        </form>

        <form action={bmAction}>
          <input type="hidden" name="post_id" value={postId} />
          <Button
            type="submit"
            variant={bookmarked ? "default" : "outline"}
            className="rounded-full"
            disabled={!canInteract || bmPending}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save
          </Button>
        </form>

        <div className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          {commentCount} comments
        </div>
      </div>

      <form action={commentAction} className="grid gap-2">
        <input type="hidden" name="post_id" value={postId} />
        <Textarea
          name="body"
          placeholder={
            canInteract ? "Write a comment…" : "Sign in to comment…"
          }
          disabled={!canInteract || commentPending}
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            className="rounded-full"
            disabled={!canInteract || commentPending}
          >
            Post comment
          </Button>
        </div>
      </form>
    </div>
  );
}


