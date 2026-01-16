import Link from "next/link";
import { Search, SquarePen } from "lucide-react";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/lib/db/types";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const unreadCountRes = user
    ? await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null)
    : null;
  const unreadCount = unreadCountRes?.count ?? 0;

  const { data: notificationsData } = user
    ? await supabase
        .from("notifications")
        .select(
          "id,user_id,actor_id,type,post_id,payload,created_at,read_at,actor:profiles!notifications_actor_id_fkey(username,full_name,avatar_url),post:posts!notifications_post_id_fkey(id,title)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };
  const notifications = (notificationsData ?? []) as unknown as NotificationRow[];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
            T
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            TechNova
          </span>
        </Link>

        {/* Hide the search bar on small screens to avoid header overflow */}
        <div className="hidden flex-1 items-center lg:flex">
          <form action="/search" method="get" className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search articles, tags, authors…"
              className="pl-9"
            />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/search" aria-label="Search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/new" className="gap-2">
              <SquarePen className="h-4 w-4" />
              Write
            </Link>
          </Button>

          <ThemeToggle />

          {user ? (
            <>
              <NotificationsBell
                unreadCount={unreadCount}
                notifications={notifications}
              />
              <UserMenu
                user={{
                  email: user.email,
                  username: (user.user_metadata?.username as string | undefined) ?? null,
                  avatarUrl:
                    (user.user_metadata?.avatar_url as string | undefined) ?? null,
                }}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


