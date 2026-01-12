"use client";

import { LogOut, User } from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  user: {
    email?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
};

export function UserMenu({ user }: Props) {
  const name = user.username || user.email || "Account";
  const fallback = (name ?? "U").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={name} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/me" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="p-0">
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none focus:bg-accent focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


