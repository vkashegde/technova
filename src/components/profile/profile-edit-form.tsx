"use client";

import * as React from "react";
import { toast } from "sonner";

import { updateProfileAction, type ProfileActionState } from "@/app/me/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileEditForm({
  initial,
}: {
  initial: { full_name: string | null; bio: string | null };
}) {
  const [state, formAction, pending] = React.useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    { ok: true, message: "" },
  );

  React.useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state.message, state.ok]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={initial.full_name ?? ""}
          placeholder="Your name"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={initial.bio ?? ""}
          placeholder="A short bio about you…"
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}


