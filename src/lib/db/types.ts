export type ProfileRow = {
  id: string;
  username: string;
  full_name: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

export type PostStatus = "draft" | "published";

export type PostRow = {
  id: string;
  author_id: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  cover_image_path: string | null;
  status: PostStatus;
  created_at: string;
};

export type PostWithAuthor = Omit<PostRow, "author_id"> & {
  author: Pick<ProfileRow, "id" | "username" | "full_name"> | null;
};

// Used for feed cards and tag/user listing pages (no content/status selected).
export type PostListRow = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_path: string | null;
  created_at: string;
  // Supabase nested select may be typed as array; normalize at usage.
  author:
    | { username: string; full_name: string | null }
    | { username: string; full_name: string | null }[]
    | null;
};

export type TagRow = {
  id: string;
  name: string;
};

export type PostTagRow = {
  post_id: string;
  tag: { name: string } | { name: string }[] | null;
};

export type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  author:
    | Pick<ProfileRow, "username" | "full_name" | "avatar_url">
    | Pick<ProfileRow, "username" | "full_name" | "avatar_url">[]
    | null;
};

export type NotificationType =
  | "post_liked"
  | "post_commented"
  | "post_bookmarked"
  | "user_followed"
  | "post_published";

export type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  post_id: string | null;
  payload: unknown | null;
  created_at: string;
  read_at: string | null;
  actor:
    | Pick<ProfileRow, "username" | "full_name" | "avatar_url">
    | Pick<ProfileRow, "username" | "full_name" | "avatar_url">[]
    | null;
  post:
    | { id: string; title: string }
    | { id: string; title: string }[]
    | null;
};


