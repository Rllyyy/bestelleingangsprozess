"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import z from "zod";

const addOrderSchema = z.object({
  customerName: z.string().trim().min(1),
  customerEmail: z.email().trim(),
  customerAddress: z.string().trim().min(1),
  orderedAt: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  itemPartName: z.string().trim().min(1),
  itemArticleNumber: z.string().trim().optional(),
  itemQuantity: z.coerce.number().int().positive(),
});

export type AddOrderInput = z.input<typeof addOrderSchema>;

export type ActionState = {
  data: AddOrderInput | null;
  error?: string | null;
  success: boolean;
};

export async function addOrder(previousState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (!claimsData || claimsError) {
    return { error: "Unauthorized", data: null, success: false };
  }

  const data = {
    customerName: formData.get("customerName") as string,
    customerEmail: formData.get("customerEmail") as string,
    customerAddress: formData.get("customerAddress") as string,
    orderedAt: formData.get("orderedAt") as string,
    price: formData.get("price") as unknown as number,
    itemPartName: formData.get("itemPartName") as string,
    itemArticleNumber: formData.get("itemArticleNumber") as string,
    itemQuantity: formData.get("itemQuantity") as unknown as number,
  };

  const parsed = addOrderSchema.safeParse(data);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return {
      data,
      error: flattened.formErrors[0] ?? "Failed to parse data",
      success: false,
    };
  }

  // Update user
  const { data: upsertedCustomer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        name: parsed.data.customerName,
        email: parsed.data.customerEmail,
        address: parsed.data.customerAddress,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (customerError || !upsertedCustomer) {
    return {
      data: parsed.data,
      error: customerError?.message ?? "Failed to upsert customer",
      success: false,
    };
  }

  // Insert Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: upsertedCustomer.id,
      status: "new",
      ordered_at: parsed.data.orderedAt,
      price: parsed.data.price,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return {
      data: parsed.data,
      error: orderError?.message ?? "Failed to create order",
      success: false,
    };
  }

  // 3) Insert order item
  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    part_name: parsed.data.itemPartName,
    article_number: parsed.data.itemArticleNumber ?? null,
    quantity: parsed.data.itemQuantity,
  });

  // invalidate data
  revalidatePath("/");

  if (itemError) {
    return {
      data: parsed.data,
      error: itemError.message,
      success: false,
    };
  }

  return { data: parsed.data, error: null, success: true };
}
