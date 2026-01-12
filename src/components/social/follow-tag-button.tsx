"use client";

import * as React from "react";
import { Hash, Plus } from "lucide-react";
import { toast } from "sonner";

import { toggleFollowTagAction, type SocialActionState } from "@/app/social/actions";
import { Button } from "@/components/ui/button";

export function FollowTagButton({
  tagId,
  tagName,
  isFollowing,
  canInteract,
}: {
  tagId: string;
  tagName: string;
  isFollowing: boolean;
  canInteract: boolean;
}) {
  const [state, action, pending] = React.useActionState<SocialActionState, FormData>(
    toggleFollowTagAction,
    { ok: true, message: "" },
  );

  React.useEffect(() => {
    if (state.message) toast.error(state.message);
  }, [state.message]);

  return (
    <form action={action}>
      <input type="hidden" name="tag_id" value={tagId} />
      <input type="hidden" name="tag_name" value={tagName} />
      <Button
        type="submit"
        variant={isFollowing ? "outline" : "default"}
        className="rounded-full"
        disabled={!canInteract || pending}
      >
        <Hash className="mr-2 h-4 w-4" />
        {isFollowing ? "Following" : "Follow"} <Plus className="ml-1 h-3 w-3" />
      </Button>
    </form>
  );
}


