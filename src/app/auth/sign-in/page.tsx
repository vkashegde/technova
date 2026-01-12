import { PasswordAuthForm } from "@/components/auth/password-auth-form";

export default function SignInPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-6xl">
        <PasswordAuthForm mode="sign-in" />
      </div>
    </div>
  );
}


