import { notFound } from "next/navigation";

import { PostCard } from "@/components/posts/post-card";
import { FollowUserButton } from "@/components/social/follow-user-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostListRow, PostTagRow, ProfileRow } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();
  const typedProfile = profile as ProfileRow;

  const isSelf = !!user && user.id === typedProfile.id;

  const followerCountRes = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", typedProfile.id);
  const followerCount = followerCountRes.count ?? 0;

  const followingCountRes = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", typedProfile.id);
  const followingCount = followingCountRes.count ?? 0;

  const isFollowing = user
    ? !!(
        await supabase
          .from("follows")
          .select("following_id")
          .eq("following_id", typedProfile.id)
          .eq("follower_id", user.id)
          .maybeSingle()
      ).data
    : false;

  const postQuery = supabase
    .from("posts")
    .select(
      "id,title,excerpt,cover_image_path,created_at,author:profiles!posts_author_id_fkey(username,full_name)",
    )
    .eq("author_id", typedProfile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!isSelf) postQuery.eq("status", "published");

  const { data } = await postQuery;
  const posts = (data ?? []) as unknown as PostListRow[];

  // Fetch tags for these posts in one query.
  const postIds = posts.map((p) => p.id);
  const { data: tagRows } = postIds.length
    ? await supabase
        .from("post_tags")
        .select("post_id, tag:tags(name)")
        .in("post_id", postIds)
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
            <CardTitle className="text-xl">
              {typedProfile.full_name || `@${typedProfile.username}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">@{typedProfile.username}</p>
          </div>
          {!isSelf ? (
            <FollowUserButton
              targetUserId={typedProfile.id}
              targetUsername={typedProfile.username}
              isFollowing={isFollowing}
              canInteract={!!user}
            />
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3">
          {typedProfile.bio ? (
            <p className="text-sm text-muted-foreground">{typedProfile.bio}</p>
          ) : null}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{followerCount}</span>{" "}
              followers
            </span>
            <span>
              <span className="font-semibold text-foreground">{followingCount}</span>{" "}
              following
            </span>
          </div>
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


