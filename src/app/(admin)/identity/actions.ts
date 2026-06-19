"use server";

import { revalidatePath } from "next/cache";
import { resolveAdminAction } from "@/lib/auth";
import { identityApi } from "@/lib/kumbu-api/identity";

function revalidateIdentity(userId: string) {
  revalidatePath("/identity");
  revalidatePath(`/identity/${userId}`);
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

export async function approveIdentityAction(userId: string, note?: string) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    await identityApi.approve(userId, note);
    revalidateIdentity(userId);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao aprovar.",
    };
  }
}

export async function rejectIdentityAction(userId: string, note: string) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    await identityApi.reject(userId, note);
    revalidateIdentity(userId);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao rejeitar.",
    };
  }
}

export async function approveIdentityDocumentAction(
  userId: string,
  side: string,
  note?: string,
) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    await identityApi.approveDocument(userId, side, note);
    revalidateIdentity(userId);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao aprovar documento.",
    };
  }
}

export async function rejectIdentityDocumentAction(
  userId: string,
  side: string,
  note: string,
) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    await identityApi.rejectDocument(userId, side, note);
    revalidateIdentity(userId);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao rejeitar documento.",
    };
  }
}
