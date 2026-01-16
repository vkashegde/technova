import Link from "next/link";
import { Hash, Search, User } from "lucide-react";

import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchPostRow = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_path: string | null;
  created_at: string;
  author_username: string;
  author_full_name: string | null;
  rank: number;
  tags: string[];
};

type SearchTagRow = { id: string; name: string; rank: number };
type SearchProfileRow = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  rank: number;
};

function toFromDate(value?: string) {
  if (!value) return null;
  // YYYY-MM-DD -> inclusive start
  return `${value}T00:00:00.000Z`;
}

function toToDate(value?: string) {
  if (!value) return null;
  // YYYY-MM-DD -> inclusive end
  return `${value}T23:59:59.999Z`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    author?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { q, tag, author, from, to } = await searchParams;
  const query = (q ?? "").trim();
  const tagFilter = (tag ?? "").trim().toLowerCase();
  const authorFilter = (author ?? "").trim();
  const fromDate = toFromDate(from ?? undefined);
  const toDate = toToDate(to ?? undefined);

  const supabase = await createClient();

  const hasPostQuery = Boolean(query || tagFilter || authorFilter || fromDate || toDate);

  const [postsRes, tagsRes, profilesRes] = await Promise.all([
    hasPostQuery
      ? supabase.rpc("search_posts", {
          q: query,
          tag: tagFilter || null,
          author: authorFilter || null,
          from_date: fromDate,
          to_date: toDate,
          limit_count: 20,
          offset_count: 0,
        })
      : Promise.resolve({ data: [] as unknown[] }),
    query ? supabase.rpc("search_tags", { q: query, limit_count: 8 }) : Promise.resolve({ data: [] as unknown[] }),
    query
      ? supabase.rpc("search_profiles", { q: query, limit_count: 8 })
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  const posts = (postsRes.data ?? []) as unknown as SearchPostRow[];
  const tagsFound = (tagsRes.data ?? []) as unknown as SearchTagRow[];
  const profilesFound = (profilesRes.data ?? []) as unknown as SearchProfileRow[];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Search</CardTitle>
            <p className="text-sm text-muted-foreground">
              Full-text search across posts, tags, and authors.
            </p>
          </CardHeader>
          <CardContent>
            <form action="/search" method="get" className="grid gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={query}
                  placeholder="Search posts, tags, authors…"
                  className="pl-9"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  name="tag"
                  defaultValue={tagFilter}
                  placeholder="Filter by tag (e.g. ai)"
                />
                <Input
                  name="author"
                  defaultValue={authorFilter}
                  placeholder="Filter by author (username)"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <div className="text-xs text-muted-foreground">From</div>
                  <Input name="from" type="date" defaultValue={from ?? ""} />
                </div>
                <div className="grid gap-1">
                  <div className="text-xs text-muted-foreground">To</div>
                  <Input name="to" type="date" defaultValue={to ?? ""} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" className="rounded-full">
                  Search
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-full">
                  <Link href="/search">Clear</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Posts</h2>
            <div className="text-xs text-muted-foreground">{posts.length} results</div>
          </div>

          {posts.length ? (
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
                    author: { username: p.author_username, full_name: p.author_full_name },
                    tags: p.tags ?? [],
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
              {hasPostQuery ? (
                <span>
                  No posts matched your search.
                </span>
              ) : (
                <span>Type a query above to search.</span>
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Tags</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {tagsFound.length ? (
              tagsFound.map((t) => (
                <Link
                  key={t.id}
                  href={`/tags/${t.name}`}
                  className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm transition hover:bg-accent"
                >
                  <span className="inline-flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    {t.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(t.rank)}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Search to discover tags.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Authors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {profilesFound.length ? (
              profilesFound.map((p) => (
                <Link
                  key={p.id}
                  href={`/u/${p.username}`}
                  className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-sm transition hover:bg-accent"
                >
                  <span className="line-clamp-1">
                    {p.full_name || `@${p.username}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(p.rank)}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Search to discover authors.
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {tagFilter ? (
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link className="underline" href={`/tags/${tagFilter}`}>
                View #{tagFilter}
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

