"use server";

import { revalidatePath } from "next/cache";
import { identityApi } from "@/lib/kumbu-api/identity";

export async function approveIdentityAction(userId: string, note?: string) {
  try {
    await identityApi.approve(userId, note);
    revalidatePath("/identity");
    revalidatePath(`/identity/${userId}`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao aprovar.",
    };
  }
}

export async function rejectIdentityAction(userId: string, note: string) {
  try {
    await identityApi.reject(userId, note);
    revalidatePath("/identity");
    revalidatePath(`/identity/${userId}`);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao rejeitar.",
    };
  }
}
