"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import z from "zod";

const loginSchema = z.object({
  email: z.string().trim(),
  password: z.string().min(8).trim(),
});

type ActionState = {
  data: z.infer<typeof loginSchema> | null;
  fieldErrors?: Record<string, string[]> | null;
  error?: string | null;
};

export async function login(previousState: ActionState, formData: FormData): Promise<ActionState> {
  "use server";

  const validatedFields = loginSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    const tree = z.treeifyError(validatedFields.error);
    const fieldErrors = {
      email: tree?.properties?.email?.errors ?? [],
      password: tree?.properties?.password?.errors ?? [],
    };

    return {
      data: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      fieldErrors,
      error: "Fields invalid",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    return {
      data: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      fieldErrors: null,
      error: "Error signing In",
    };
  }

  if (!error) {
    redirect("/");
  }

  return {
    data: validatedFields.data,
    fieldErrors: {},
    error: null,
  };
}
