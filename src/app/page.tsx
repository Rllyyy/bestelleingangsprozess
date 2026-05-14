import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data) {
    redirect("/login");
  }

  return (
    <>
      <h1>Home</h1>
    </>
  );
}
