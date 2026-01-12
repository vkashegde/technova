"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  type AuthActionState,
  signInWithPasswordAction,
  signUpWithPasswordAction,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "sign-in" | "sign-up";

export function PasswordAuthForm({ mode }: { mode: Mode }) {
  const search = useSearchParams();
  const next = search.get("next") ?? "/";

  const action =
    mode === "sign-in" ? signInWithPasswordAction : signUpWithPasswordAction;

  const [state, formAction, pending] = React.useActionState<AuthActionState, FormData>(
    action,
    { ok: true, message: "" },
  );

  React.useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state.message, state.ok]);

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === "sign-in" ? "Welcome back" : "Create your profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          {mode === "sign-up" ? (
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="vkash"
                autoComplete="username"
                required
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
            />
          </div>

          <input type="hidden" name="next" value={next} />

          <Button type="submit" className="rounded-full" disabled={pending}>
            {pending
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </Button>

          <p className="text-sm text-muted-foreground">
            {mode === "sign-in" ? (
              <>
                New here?{" "}
                <Link className="text-foreground underline" href="/auth/sign-up">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link className="text-foreground underline" href="/auth/sign-in">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}


