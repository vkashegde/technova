import Image from "next/image";
import Link from "next/link";
import { Calendar, Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { publicPostImageUrl } from "@/lib/supabase/storage";

type Props = {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    cover_image_path: string | null;
    created_at: string;
    author: { username: string; full_name: string | null } | null;
    tags: string[];
  };
};

export function PostCard({ post }: Props) {
  const coverUrl = publicPostImageUrl(post.cover_image_path);

  return (
    <Card className="group overflow-hidden rounded-3xl">
      <Link href={`/post/${post.id}`} className="block">
        {coverUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}

        <div className="space-y-3 p-5">
          <h3 className="text-balance text-lg font-semibold tracking-tight">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {post.author ? (
              <span className="font-medium text-foreground">
                {post.author.full_name || `@${post.author.username}`}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>

          {post.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((t) => (
                <span key={t}>
                  <Badge variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {t}
                  </Badge>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </Card>
  );
}


