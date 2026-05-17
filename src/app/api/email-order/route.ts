import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateOrder } from "@/lib/validate-order";
import { revalidatePath } from "next/cache";

type Results = {
  index: number;
  ok: boolean;
  error: string | null;
}[];

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    return NextResponse.json({ error: claimsError?.message || "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(new URL("/data.json", request.nextUrl.origin));

  const data = await res.json();

  if (!Array.isArray(data)) {
    return NextResponse.json({ error: "Expected array in data.json" }, { status: 400 });
  }
  const results: Results = [];

  for (let index = 0; index < data.length; index++) {
    let customerId: string | null = null;
    let orderId: string | null = null;

    // Validate data
    const { validData, errors: validationsErrors } = validateOrder(data[index]);

    // Without email and order at an order can't be processes
    if (!validData.customer.email || !validData.ordered_at) {
      return NextResponse.json(
        { error: "Order can not be process without customer email or ordered at!" },
        { status: 400 },
      );
    }

    // Get or create customer
    try {
      const { data: upsertedCustomer, error: upsertError } = await supabase
        .from("customers")
        .upsert(validData.customer, { onConflict: "email" })
        .select("id")
        .single();

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      if (!upsertedCustomer.id) {
        throw new Error("Missing customerId");
      }

      customerId = upsertedCustomer.id;
    } catch (err) {
      results.push({ index, ok: false, error: err instanceof Error ? err.message : "Customer error" });
      continue;
    }

    // Create order
    try {
      const { data, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId as string,
          status: validationsErrors.length > 0 ? "faulty" : "submitted",
          ...(validData.ordered_at ? { ordered_at: validData.ordered_at } : {}),
          ...(validData.price ? { price: validData.price } : {}),
        })
        .select("id")
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (!data.id) {
        throw new Error("Missing orderId");
      }

      orderId = data.id;
    } catch (err) {
      results.push({ index, ok: false, error: err instanceof Error ? err.message : "Customer error" });
      continue;
    }

    // Create order items
    const orderItems = validData.items.map((item) => ({
      order_id: orderId as string,
      ...(item.article_number ? { article_number: item.article_number } : {}),
      ...(item.part_name ? { part_name: item.part_name } : {}),
      ...(item.quantity ? { quantity: item.quantity } : {}),
    }));

    try {
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError?.message);
      }
    } catch (err) {
      results.push({ index, ok: false, error: err instanceof Error ? err.message : "Items Error" });
      continue;
    }

    results.push({ index, ok: true, error: null });

    revalidatePath("/");
    revalidatePath("/dashboard");
  }

  return NextResponse.json({ results });
}

export async function DELETE() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) {
    return NextResponse.json({ error: claimsError?.message || "Unauthorized" }, { status: 401 });
  }

  // Delete in FK-safe order
  const { error: itemsError } = await supabase.from("order_items").delete().not("id", "is", null);
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { error: ordersError } = await supabase.from("orders").delete().not("id", "is", null);
  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const { error: customersError } = await supabase.from("customers").delete().not("id", "is", null);
  if (customersError) {
    return NextResponse.json({ error: customersError.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
