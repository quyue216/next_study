import { createServerClient } from "@/lib/supabase.server";
import { redirect } from "next/navigation";
import { AuthForm } from "./_components/auth-form";

export default async function LoginPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/todos");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}
