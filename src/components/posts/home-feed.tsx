import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/posts/post-card";
import type { PostListRow, PostTagRow } from "@/lib/db/types";

type Mode = "for-you" | "following";

export async function HomeFeed({ mode = "for-you" }: { mode?: Mode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (mode === "following" && !user) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        Sign in to see a personalized feed based on the users and tags you follow.
      </div>
    );
  }

  let posts: PostListRow[] = [];

  if (mode === "following" && user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    const followedUserIds = (follows ?? []).map((f) => f.following_id as string);

    const { data: tagFollows } = await supabase
      .from("tag_follows")
      .select("tag_id")
      .eq("user_id", user.id);
    const followedTagIds = (tagFollows ?? []).map((t) => t.tag_id as string);

    const { data: postTagRows } = followedTagIds.length
      ? await supabase
          .from("post_tags")
          .select("post_id")
          .in("tag_id", followedTagIds)
          .limit(500)
      : { data: [] };
    const postIdsFromTags = Array.from(
      new Set((postTagRows ?? []).map((r) => r.post_id as string)),
    );

    if (!followedUserIds.length && !postIdsFromTags.length) {
      return (
        <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
          You’re not following anyone yet. Follow a user or a tag to personalize
          your feed.
        </div>
      );
    }

    const orParts: string[] = [];
    if (followedUserIds.length) {
      orParts.push(`author_id.in.(${followedUserIds.join(",")})`);
    }
    if (postIdsFromTags.length) {
      orParts.push(`id.in.(${postIdsFromTags.join(",")})`);
    }

    const { data } = await supabase
      .from("posts")
      .select(
        "id,title,excerpt,cover_image_path,created_at,author:profiles!posts_author_id_fkey(username,full_name)",
      )
      .eq("status", "published")
      .or(orParts.join(","))
      .order("created_at", { ascending: false })
      .limit(20);

    posts = (data ?? []) as unknown as PostListRow[];
  } else {
    const { data } = await supabase
      .from("posts")
      .select(
        "id,title,excerpt,cover_image_path,created_at,author:profiles!posts_author_id_fkey(username,full_name)",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(20);

    posts = (data ?? []) as unknown as PostListRow[];
  }

  if (!posts?.length) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        No articles yet. Create the first one from <span className="text-foreground">Write</span>.
      </div>
    );
  }

  // Fetch tags for these posts in one query.
  const postIds = posts.map((p) => p.id);
  const { data: tagRows } = await supabase
    .from("post_tags")
    .select("post_id, tag:tags(name)")
    .in("post_id", postIds);

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
  );
}


