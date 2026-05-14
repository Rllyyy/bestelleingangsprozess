"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <DropdownMenuItem
      onClick={async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
          router.push("/login");
          router.refresh();
        } else {
          alert(error.message);
        }
      }}
    >
      Log Out
    </DropdownMenuItem>
  );
}
