"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { JSONContent } from "@tiptap/core";

import { createPostAction, updatePostAction, type PostActionState } from "@/app/posts/actions";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { publicPostImageUrl } from "@/lib/supabase/storage";

type Mode = "create" | "edit";

type InitialPost = {
  id: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "published";
  cover_image_path: string | null;
  content: JSONContent | null;
  tags: string[];
};

export function PostEditorForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: InitialPost;
}) {
  const [status, setStatus] = React.useState<"draft" | "published">(
    initial?.status ?? "published",
  );
  const [content, setContent] = React.useState<JSONContent>(
    initial?.content ?? { type: "doc", content: [] },
  );
  const [coverPath, setCoverPath] = React.useState<string>(
    initial?.cover_image_path ?? "",
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = React.useState<string | null>(
    publicPostImageUrl(initial?.cover_image_path) ?? null,
  );
  const [uploading, setUploading] = React.useState(false);

  const action = mode === "create" ? createPostAction : updatePostAction;
  const [state, formAction, pending] = React.useActionState<PostActionState, FormData>(
    action,
    { ok: true, message: "" },
  );

  React.useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state.message, state.ok]);

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not signed in.");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const name = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`) + `.${ext}`;
      const path = `${user.id}/${name}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;

      setCoverPath(path);
      setCoverPreviewUrl(publicPostImageUrl(path));
      toast.success("Cover image uploaded.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Write a new article" : "Edit article"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-6">
          {mode === "edit" ? (
            <input type="hidden" name="post_id" value={initial?.id} />
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initial?.title ?? ""}
              placeholder="Breaking: …"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excerpt">Short description (optional)</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={initial?.excerpt ?? ""}
              placeholder="A quick summary that appears in the feed…"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={(initial?.tags ?? []).join(", ")}
              placeholder="ai, world, finance"
            />
            <p className="text-xs text-muted-foreground">
              Tip: separate tags with commas. Tags are normalized to lowercase.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v === "draft" ? "draft" : "published")}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="status" value={status} />
          </div>

          <div className="grid gap-2">
            <Label>Cover image (optional)</Label>
            {coverPreviewUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border bg-muted">
                <Image
                  src={coverPreviewUrl}
                  alt="Cover image"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadCover(file);
              }}
              disabled={uploading}
            />
            <input type="hidden" name="cover_image_path" value={coverPath} />
          </div>

          <div className="grid gap-2">
            <Label>Content</Label>
            <RichTextEditor initialContent={content} onChange={setContent} />
            <input type="hidden" name="content" value={JSON.stringify(content)} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" className="rounded-full" disabled={pending || uploading}>
              {pending ? "Saving…" : mode === "create" ? "Publish" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


