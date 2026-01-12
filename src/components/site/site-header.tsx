import Link from "next/link";
import { Search, SquarePen } from "lucide-react";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, tags, authors…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/new" className="gap-2">
              <SquarePen className="h-4 w-4" />
              Write
            </Link>
          </Button>

          <ThemeToggle />

          {user ? (
            <UserMenu
              user={{
                email: user.email,
                username: (user.user_metadata?.username as string | undefined) ?? null,
                avatarUrl:
                  (user.user_metadata?.avatar_url as string | undefined) ?? null,
              }}
            />
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


