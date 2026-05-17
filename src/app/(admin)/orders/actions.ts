"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["processing", "shipping", "delivered", "cancelled"]),
});

export async function updateOrderStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: parsed.data.status,
      show_track: parsed.data.status !== "delivered" && parsed.data.status !== "cancelled",
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "order.update_status",
    entity: "orders",
    entityId: parsed.data.id,
    payload: { status: parsed.data.status },
  });

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return { ok: true, message: "Estado atualizado." };
}

export async function deleteOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  await logAudit({ action: "order.delete", entity: "orders", entityId: id });
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return { ok: true, message: "Pedido eliminado." };
}
