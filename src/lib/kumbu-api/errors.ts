import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import type { ActionState } from "@/lib/action-state";

/** Java Bean Validation property names → form field names (snake_case). */
export function backendFieldToFormName(field: string): string {
  if (field.includes("_")) return field;
  return field.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function mapBackendFieldsToForm(
  fields?: Record<string, string>,
): Record<string, string> | undefined {
  if (!fields || Object.keys(fields).length === 0) return undefined;
  const mapped: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    mapped[backendFieldToFormName(key)] = message;
  }
  return mapped;
}

export function isKumbuApiError(error: unknown): error is KumbuApiError {
  return error instanceof KumbuApiError;
}

export function toActionState(error: unknown): ActionState {
  if (isKumbuApiError(error)) {
    return {
      ok: false,
      message: error.message,
      fields: mapBackendFieldsToForm(error.fields),
    };
  }
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }
  return { ok: false, message: "Ocorreu um erro. Tente novamente." };
}

export function toLoginError(error: unknown): { error: string; fields?: Record<string, string> } {
  if (isKumbuApiError(error)) {
    return {
      error: error.message,
      fields: mapBackendFieldsToForm(error.fields),
    };
  }
  if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
    return {
      error:
        "Não foi possível ligar ao backend Kumbu. Confirma que a API está a correr em http://127.0.0.1:8080 (docker compose up ou Spring Boot) e reinicia o admin (npm run dev).",
    };
  }
  return {
    error: error instanceof Error ? error.message : "Erro inesperado.",
  };
}

/** Converte FormData em objeto simples para enviar à API. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      out[key] = trimmed === "" ? null : trimmed;
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function formDataString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function formDataNumber(formData: FormData, key: string, fallback = 0): number {
  const raw = formData.get(key);
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}
