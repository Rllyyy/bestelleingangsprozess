import z from "zod";

const orderItemSchema = z.object({
  id: z.string(),
  article_number: z.string().nullable().optional(),
  part_name: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
});

const customerSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string(),
});

const orderRowSchema = z.object({
  id: z.string(),
  status: z.string(),
  price: z.number().nullable().optional(),
  ordered_at: z.string(),
  customers: customerSchema.nullable().optional(),
  order_items: z.array(orderItemSchema).nullable().optional(),
});

export const orderRowsSchema = z.array(orderRowSchema);

export type OrderRows = z.infer<typeof orderRowsSchema>;
export type OrderRow = z.infer<typeof orderRowSchema>;
