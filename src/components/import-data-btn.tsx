"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function ImportDataButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    const res = await fetch("/api/email-order", { method: "POST" });
    const body = await res.json();
    setLoading(false);

    if (!res.ok) {
      console.error(body);
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <Button onClick={onClick} disabled={loading} variant={"default"}>
      {loading ? "Importing..." : "Import Data"}
    </Button>
  );
}
