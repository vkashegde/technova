import type { NotificationType } from "@/lib/db/types";

export function notificationText(type: NotificationType) {
  switch (type) {
    case "post_liked":
      return "liked your post";
    case "post_commented":
      return "commented on your post";
    case "post_bookmarked":
      return "bookmarked your post";
    case "user_followed":
      return "started following you";
    case "post_published":
      return "published a new post";
    default:
      return "sent a notification";
  }
}


