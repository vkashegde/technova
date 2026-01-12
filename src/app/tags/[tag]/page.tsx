import Link from "next/link";

import { PostCard } from "@/components/posts/post-card";
import { FollowTagButton } from "@/components/social/follow-tag-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostListRow, PostTagRow, TagRow } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const tagName = tag.toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tagRow } = await supabase
    .from("tags")
    .select("id,name")
    .eq("name", tagName)
    .maybeSingle();

  if (!tagRow) {
    return (
      <div className="grid gap-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl">#{tagName}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This tag doesn’t exist yet (no posts have used it).
            <div className="mt-3">
              Create the first article with <span className="text-foreground">#{tagName}</span>{" "}
              and it will automatically appear here.
            </div>
            <div className="mt-4">
              <Link className="text-foreground underline" href="/new">
                Write an article
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const typedTag = tagRow as TagRow;

  const isFollowing = user
    ? !!(
        await supabase
          .from("tag_follows")
          .select("tag_id")
          .eq("tag_id", typedTag.id)
          .eq("user_id", user.id)
          .maybeSingle()
      ).data
    : false;

  // Find posts for this tag.
  const { data: postTagRows } = await supabase
    .from("post_tags")
    .select("post_id")
    .eq("tag_id", typedTag.id)
    .limit(200);

  const postIds = (postTagRows ?? []).map((r) => r.post_id as string);

  const { data: postsData } = postIds.length
    ? await supabase
        .from("posts")
        .select(
          "id,title,excerpt,cover_image_path,created_at,author:profiles(username,full_name)",
        )
        .in("id", postIds)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };
  const posts = (postsData ?? []) as unknown as PostListRow[];

  // Get tags for posts (optional). Reuse the HomeFeed logic? keep simple here:
  const { data: tagRows } = posts.length
    ? await supabase
        .from("post_tags")
        .select("post_id, tag:tags(name)")
        .in("post_id", posts.map((p) => p.id))
    : { data: [] };

  const tagsByPost = new Map<string, string[]>();
  for (const row of (tagRows ?? []) as PostTagRow[]) {
    const pid = row.post_id;
    const tagObj = Array.isArray(row.tag) ? row.tag[0] ?? null : row.tag;
    const name = tagObj?.name;
    if (!pid || !name) continue;
    const arr = tagsByPost.get(pid) ?? [];
    arr.push(name);
    tagsByPost.set(pid, arr);
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">#{typedTag.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Follow this tag to get related posts in your feed.
            </p>
          </div>
          <FollowTagButton
            tagId={typedTag.id}
            tagName={typedTag.name}
            isFollowing={isFollowing}
            canInteract={!!user}
          />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Showing latest published posts tagged{" "}
          <span className="text-foreground">#{typedTag.name}</span>.
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={{
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              cover_image_path: p.cover_image_path,
              created_at: p.created_at,
              author: Array.isArray(p.author) ? p.author[0] ?? null : p.author,
              tags: tagsByPost.get(p.id) ?? [],
            }}
          />
        ))}
      </div>
    </div>
  );
}


