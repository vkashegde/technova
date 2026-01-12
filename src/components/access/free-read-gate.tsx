"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ReadEntry = { id: string; ts: number };

const STORAGE_KEY = "newsblogs_free_reads_v1";

function readEntries(): ReadEntry[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => ({ id: String(x?.id ?? ""), ts: Number(x?.ts ?? 0) }))
      .filter((x) => x.id && Number.isFinite(x.ts));
  } catch {
    return [];
  }
}

function writeEntries(entries: ReadEntry[]) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function FreeReadGate({
  postId,
  isAuthed,
  freeLimit = 3,
  children,
}: {
  postId: string;
  isAuthed: boolean;
  freeLimit?: number;
  children: React.ReactNode;
}) {
  const [blocked, setBlocked] = React.useState(false);

  React.useEffect(() => {
    if (isAuthed) return;
    const now = Date.now();

    // Keep reads for last 7 days.
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const entries = readEntries().filter((e) => now - e.ts < weekMs);

    const has = entries.some((e) => e.id === postId);
    const next = has ? entries : [{ id: postId, ts: now }, ...entries];

    writeEntries(next);
    setBlocked(next.length > freeLimit);
  }, [isAuthed, postId, freeLimit]);

  if (isAuthed) return <>{children}</>;

  return (
    <div className="relative">
      <div
        className={`relative ${blocked ? "max-h-[28rem] overflow-hidden" : ""}`}
      >
        <div className={blocked ? "pointer-events-none blur-[2px]" : ""}>
          {children}
        </div>
        {blocked ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
        ) : null}
      </div>

      {blocked ? (
        <div className="absolute inset-x-0 bottom-6 mx-auto w-[min(520px,calc(100%-2rem))] rounded-3xl border bg-background p-5 shadow-lg">
          <div className="text-sm font-semibold">You’ve reached the free limit</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign up to continue reading and unlock likes, bookmarks, comments, and following.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/auth/sign-in?next=/post/${postId}`}>Sign in</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href={`/auth/sign-up?next=/post/${postId}`}>Create account</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


