import Link from "next/link";
import { ArrowRight, Flame, Hash, Sparkles } from "lucide-react";

import { HomeFeed } from "@/components/posts/home-feed";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TrendingTagRow = { id: string; name: string; score: number };
type TrendingAuthorRow = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  score: number;
};
type TrendingPostRow = {
  id: string;
  title: string;
  excerpt: string | null;
  created_at: string;
  score: number;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = tab === "following" ? "following" : "for-you";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [trendingTagsRes, trendingAuthorsRes, trendingPostsRes] = await Promise.all([
    supabase.rpc("get_trending_tags", { limit_count: 6 }),
    supabase.rpc("get_trending_authors", { limit_count: 5 }),
    supabase.rpc("get_trending_posts", { limit_count: 5 }),
  ]);

  const trendingTags = (trendingTagsRes.data ?? []) as unknown as TrendingTagRow[];
  const trendingAuthors = (trendingAuthorsRes.data ?? []) as unknown as TrendingAuthorRow[];
  const trendingPosts = (trendingPostsRes.data ?? []) as unknown as TrendingPostRow[];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-background via-background to-muted p-6">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-linear-to-br from-primary/30 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-linear-to-tr from-foreground/10 to-transparent blur-3xl" />

          <div className="relative space-y-3">
            {!user ? (
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Read free. Save & engage after you sign up.
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome back — your feed is ready.
              </div>
            )}
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              News that feels modern — curated, social, and beautifully readable.
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              Follow authors and tags to shape your feed. Like, bookmark, and
              discuss with the community. Write your own stories with a rich
              editor and one hero image.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!user ? (
                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Create your profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/me"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Go to profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              <Link
                href="/new"
                className="inline-flex h-10 items-center justify-center rounded-full border bg-background px-5 text-sm font-medium shadow-sm transition hover:bg-accent"
              >
                Write an article
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Your feed</h2>
              <p className="text-sm text-muted-foreground">
                Latest published articles.
              </p>
            </div>
            <Link
              href="/new"
              className="inline-flex h-9 items-center justify-center rounded-full border bg-background px-4 text-sm font-medium transition hover:bg-accent"
            >
              Write
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Link
              href="/"
              className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
                active === "for-you"
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background hover:bg-accent"
              }`}
            >
              For you
            </Link>
            <Link
              href="/?tab=following"
              className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
                active === "following"
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background hover:bg-accent"
              }`}
            >
              Following
            </Link>
          </div>

          <div className="mt-6">
            <HomeFeed mode={active} />
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            <h3 className="text-sm font-semibold tracking-tight">Trending</h3>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Hot posts</div>
              {trendingPosts.length ? (
                <div className="grid gap-2">
                  {trendingPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/post/${p.id}`}
                      className="rounded-xl border bg-background px-3 py-2 transition hover:bg-accent"
                    >
                      <div className="line-clamp-2 text-sm font-medium">{p.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Score {Math.round(p.score)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No activity yet — likes, comments, and views will populate this.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Hot tags</div>
              {trendingTags.length ? (
                <div className="grid gap-2">
                  {trendingTags.map((t) => (
                    <Link
                      key={t.id}
                      href={`/tags/${t.name}`}
                      className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 transition hover:bg-accent"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        {t.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(t.score)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No trending tags yet.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Hot authors</div>
              {trendingAuthors.length ? (
                <div className="grid gap-2">
                  {trendingAuthors.map((a) => (
                    <Link
                      key={a.id}
                      href={`/u/${a.username}`}
                      className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 transition hover:bg-accent"
                    >
                      <span className="line-clamp-1">
                        {a.full_name || `@${a.username}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(a.score)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No trending authors yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <h3 className="text-sm font-semibold tracking-tight">
            Free reading limit
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Anonymous users can read a few articles free. After that, we’ll
            prompt them to sign up to continue reading and to unlock likes,
            bookmarks, comments, and following.
          </p>
        </div>
      </aside>
    </div>
  );
}
