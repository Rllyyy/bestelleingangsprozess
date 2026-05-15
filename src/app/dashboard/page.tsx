import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
    <main className='p-4 flex-1 flex gap-2 flex-col'>
      <h1 className='text-xl'>Dashboard</h1>
      <div className='flex flex-wrap gap-4'>
        <Suspense fallback={<p>Loading...</p>}>
          <ErrorRate />
        </Suspense>
      </div>
    </main>
  );
}

async function ErrorRate() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    return <p>Unauthorized</p>;
  }

  const [{ count: total }, { count: faulty }] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "faulty"),
  ]);

  const totalCount = total ?? 0;
  const faultyCount = faulty ?? 0;
  const errorRate = totalCount > 0 ? (faultyCount / totalCount) * 100 : 0;

  return (
    <Card className='flex-1 overflow-hidden border-muted/60 bg-linear-to-br from-muted/40 via-background to-background max-w-fit'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground '>Error rate (total)</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='flex items-end gap-2'>
          <div className='text-4xl font-semibold tracking-tight'>{errorRate.toFixed(1)}%</div>
          <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800'>faulty</span>
        </div>
        <div className='text-sm text-muted-foreground'>
          {faultyCount} faulty / {totalCount} total
        </div>
      </CardContent>
    </Card>
  );
}
