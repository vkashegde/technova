"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/notifications/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NotificationRow, NotificationType } from "@/lib/db/types";
import { notificationText } from "@/lib/notifications";

function normalizeActor(n: NotificationRow) {
  const actor = Array.isArray(n.actor) ? n.actor[0] ?? null : n.actor;
  return actor;
}

function normalizePost(n: NotificationRow) {
  const post = Array.isArray(n.post) ? n.post[0] ?? null : n.post;
  return post;
}

function hrefFor(n: NotificationRow) {
  const actor = normalizeActor(n);
  const post = normalizePost(n);

  if (n.type === "user_followed" && actor?.username) return `/u/${actor.username}`;
  if (post?.id) return `/post/${post.id}`;
  return "/me";
}

export function NotificationsBell({
  unreadCount,
  notifications,
}: {
  unreadCount: number;
  notifications: NotificationRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const markAll = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (!res.ok) toast.error(res.message);
      else toast.success(res.message);
      router.refresh();
    });
  };

  const openAndMark = (id: string, href: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (!res.ok) toast.error(res.message);
      setOpen(false);
      router.push(href);
      router.refresh();
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <div className="sticky top-0 z-10 border-b bg-background/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <SheetHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-base">Notifications</SheetTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={markAll}
                disabled={pending || unreadCount === 0}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{unreadCount ? `${unreadCount} unread` : "All caught up"}</span>
              <Link className="underline underline-offset-4" href="/me">
                View profile
              </Link>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid gap-2 p-4">
            {notifications.length ? (
              notifications.map((n) => {
                const actor = normalizeActor(n);
                const post = normalizePost(n);
                const isUnread = !n.read_at;
                const href = hrefFor(n);

                const actorName =
                  actor?.full_name ||
                  (actor?.username ? `@${actor.username}` : "Someone");
                const text = notificationText(n.type as NotificationType);

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openAndMark(n.id, href)}
                    className={`group relative flex w-full items-start gap-3 rounded-2xl border p-3 text-left shadow-sm transition hover:bg-accent ${
                      isUnread ? "bg-muted/30" : "bg-background"
                    }`}
                  >
                    {isUnread ? (
                      <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-primary" />
                    ) : null}

                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={actor?.avatar_url ?? undefined}
                        alt={actorName}
                      />
                      <AvatarFallback>
                        {(actor?.username ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-sm leading-5">
                        <span className="font-semibold">{actorName}</span>{" "}
                        <span className="text-muted-foreground">{text}</span>
                      </div>
                      {post?.title ? (
                        <div className="line-clamp-1 text-sm text-foreground/90">
                          {post.title}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <Badge variant="default" className="rounded-full">
                          New
                        </Badge>
                      ) : null}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border bg-muted/30 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border bg-background">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-4 text-sm font-semibold">No notifications yet</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  When someone follows you or interacts with your posts, you’ll see it here.
                </p>
                <div className="mt-4">
                  <Button asChild className="rounded-full">
                    <Link href="/">Go to feed</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-background px-4 py-3 text-xs text-muted-foreground">
          Tip: notifications are created when someone likes, comments, bookmarks, follows you, or when authors you follow publish.
        </div>
      </SheetContent>
    </Sheet>
  );
}


