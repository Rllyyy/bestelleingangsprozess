import OrderTable from "@/components/order-tbl";
import { orderRowsSchema } from "@/lib/schema/orders";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data) {
    redirect("/login");
  }

  return (
    <main className='p-4 flex-1'>
      <h1>Orders</h1>
      <Suspense fallback={<p>Loading ...</p>}>
        <Orders />
      </Suspense>
    </main>
  );
}

async function Orders() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    return <p>Unauthorized</p>;
  }

  // fetch content
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      ordered_at,
      price,
      customers:customer_id (
        id,
        name,
        email,
        address
      ),
      order_items (
        id,
        article_number,
        part_name,
        quantity
      )
    `,
    )
    .order("ordered_at", { ascending: false });

  if (error) {
    return <p>Failed to load orders: {error.message}</p>;
  }

  // validate data
  const { data: validData, error: validationError } = orderRowsSchema.safeParse(data);

  if (validationError) {
    return <p>Failed to validate data</p>;
  }

  return <OrderTable orders={validData} />;
}
