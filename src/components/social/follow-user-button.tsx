"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { toggleFollowUserAction, type SocialActionState } from "@/app/social/actions";
import { Button } from "@/components/ui/button";

export function FollowUserButton({
  targetUserId,
  targetUsername,
  isFollowing,
  canInteract,
}: {
  targetUserId: string;
  targetUsername: string;
  isFollowing: boolean;
  canInteract: boolean;
}) {
  const [state, action, pending] = React.useActionState<SocialActionState, FormData>(
    toggleFollowUserAction,
    { ok: true, message: "" },
  );

  React.useEffect(() => {
    if (state.message) toast.error(state.message);
  }, [state.message]);

  return (
    <form action={action}>
      <input type="hidden" name="target_user_id" value={targetUserId} />
      <input type="hidden" name="target_username" value={targetUsername} />
      <Button
        type="submit"
        variant={isFollowing ? "outline" : "default"}
        className="rounded-full"
        disabled={!canInteract || pending}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </form>
  );
}


