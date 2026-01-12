import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight, Users } from "lucide-react";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PostRow, ProfileRow } from "@/lib/db/types";
import { publicPostImageUrl } from "@/lib/supabase/storage";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) notFound();
  const typedProfile = profile as ProfileRow;

  const followerCountRes = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id);
  const followerCount = followerCountRes.count ?? 0;

  const followingCountRes = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", user.id);
  const followingCount = followingCountRes.count ?? 0;

  const { data: followersRaw } = await supabase
    .from("follows")
    .select("follower:profiles!follows_follower_id_fkey(username,full_name,avatar_url)")
    .eq("following_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const followers =
    (followersRaw ?? [])
      .map((r) => {
        const val = (r as unknown as { follower: ProfileRow | ProfileRow[] | null }).follower;
        return Array.isArray(val) ? val[0] ?? null : val;
      })
      .filter((x): x is ProfileRow => Boolean(x)) ?? [];

  const { data: followingRaw } = await supabase
    .from("follows")
    .select("following:profiles!follows_following_id_fkey(username,full_name,avatar_url)")
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const following =
    (followingRaw ?? [])
      .map((r) => {
        const val = (r as unknown as { following: ProfileRow | ProfileRow[] | null }).following;
        return Array.isArray(val) ? val[0] ?? null : val;
      })
      .filter((x): x is ProfileRow => Boolean(x)) ?? [];

  const { data: postsData } = await supabase
    .from("posts")
    .select("id,title,excerpt,cover_image_path,status,created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (postsData ?? []) as unknown as Array<
    Pick<PostRow, "id" | "title" | "excerpt" | "cover_image_path" | "status" | "created_at">
  >;

  return (
    <div className="grid gap-6">
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={typedProfile.avatar_url ?? undefined} alt="" />
              <AvatarFallback>
                {(typedProfile.username ?? "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {typedProfile.full_name || `@${typedProfile.username}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="text-foreground">{user.email}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                User id:{" "}
                <span className="break-all font-mono text-foreground">{user.id}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{followerCount}</span>{" "}
                  followers
                </span>
                <span>
                  <span className="font-semibold text-foreground">{followingCount}</span>{" "}
                  following
                </span>
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/u/${typedProfile.username}`} className="gap-2">
              View public profile <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <div className="text-sm font-semibold">Edit profile</div>
            <ProfileEditForm
              initial={{ full_name: typedProfile.full_name, bio: typedProfile.bio ?? null }}
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" /> Followers
              </div>
              <div className="grid gap-2">
                {followers.length ? (
                  followers.map((p) => (
                    <Link
                      key={p.username}
                      href={`/u/${p.username}`}
                      className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="truncate">
                        {p.full_name || `@${p.username}`}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No followers yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" /> Following
              </div>
              <div className="grid gap-2">
                {following.length ? (
                  following.map((p) => (
                    <Link
                      key={p.username}
                      href={`/u/${p.username}`}
                      className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm hover:bg-accent"
                    >
                      <span className="truncate">
                        {p.full_name || `@${p.username}`}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You’re not following anyone yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Your posts</h2>
          <p className="text-sm text-muted-foreground">
            Drafts are only visible to you.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/new">Write</Link>
        </Button>
      </div>

      {posts.length ? (
        <div className="grid gap-3">
          {posts.map((p) => {
            const cover = publicPostImageUrl(p.cover_image_path);
            const viewHref = p.status === "published" ? `/post/${p.id}` : `/post/${p.id}/edit`;
            return (
              <Card key={p.id} className="rounded-3xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={viewHref}
                        className="text-base font-semibold tracking-tight hover:underline"
                      >
                        {p.title}
                      </Link>
                      <Badge variant={p.status === "draft" ? "secondary" : "default"}>
                        {p.status}
                      </Badge>
                    </div>
                    {p.excerpt ? (
                      <p className="text-sm text-muted-foreground">{p.excerpt}</p>
                    ) : null}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href={`/post/${p.id}/edit`}>Edit</Link>
                      </Button>
                      <Button asChild variant="ghost" className="rounded-full">
                        <Link href={viewHref}>
                          {p.status === "published" ? "View" : "Continue editing"}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="hidden h-20 w-32 rounded-2xl border object-cover sm:block"
                    />
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-3xl">
          <CardContent className="p-6 text-sm text-muted-foreground">
            You haven’t written any posts yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}


