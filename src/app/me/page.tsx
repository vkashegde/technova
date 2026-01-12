import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="grid gap-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{user?.email}</span>.
          <div className="mt-3">
            Next: we’ll load your public profile, followers/following, and your
            posts from Supabase.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


