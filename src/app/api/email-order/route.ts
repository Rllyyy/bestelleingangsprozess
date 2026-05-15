import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateOrder } from "@/lib/validate-order";

export async function GET() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    return NextResponse.json({ error: claimsError?.message || "Unauthorized" }, { status: 401 });
  }

  // Simulierte KI-Extraktion (valid)
  const extractedData = {
    customer: {
      name: "Max Mustermann",
      address: "Musterstraße 1, 12345 Hamburg",
      email: "max.mustermann@example.com",
    },
    price: 105.98,
    ordered_at: "2026-05-14T06:20:17.000Z",
    items: [
      {
        article_number: "13",
        part_name: "Schraube",
        quantity: 10,
      },
      {
        article_number: "01",
        part_name: "Zange",
        quantity: 5,
      },
    ],
  };

  // const extractedData = {
  //   customer: {
  //     name: "Niklas Fischer",
  //     address: "Langer Weg 123, 45612 Hamburg",
  //     email: "niklas.fischer@mail.de",
  //   },
  //   price: -105.98,
  //   ordered_at: "2026-05-14T06:20:17.000Z",
  //   items: [
  //     {
  //       article_number: "13",
  //       part_name: "Schraube",
  //       quantity: 10,
  //     },
  //     {
  //       // article_number: "01",
  //       part_name: "Zange",
  //       quantity: 5,
  //     },
  //   ],
  // };

  // Validate data
  const { validData, errors } = validateOrder(extractedData);

  // return NextResponse.json({ errors, validData });

  // Without email and order at an order can't be processes
  if (!validData.customer.email || !validData.ordered_at) {
    return NextResponse.json(
      { error: "Order can not be process without customer email or ordered at!" },
      { status: 400 },
    );
  }

  // Get or create customer
  let customerId: string;

  try {
    const { data: upsertedCustomer, error: upsertError } = await supabase
      .from("customers")
      .upsert(validData.customer, { onConflict: "email" })
      .select("id")
      .single();

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    customerId = upsertedCustomer.id;
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Customer error" }, { status: 500 });
  }

  // Create Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      status: errors.length > 0 ? "faulty" : "submitted",
      ...(validData.ordered_at ? { ordered_at: validData.ordered_at } : {}),
      ...(validData.price ? { price: validData.price } : {}),
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Create order items
  const orderItems = validData.items.map((item) => ({
    order_id: order.id,
    ...(item.article_number ? { article_number: item.article_number } : {}),
    ...(item.part_name ? { part_name: item.part_name } : {}),
    ...(item.quantity ? { quantity: item.quantity } : {}),
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    order,
  });
}
