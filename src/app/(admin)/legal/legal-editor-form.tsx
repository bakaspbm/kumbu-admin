"use client";


import type { ActionState } from "@/lib/action-state";
import { useActionState } from "react";
import { useRouterRefreshOnActions } from "@/hooks/use-router-refresh-on-actions";
import { FeedbackBanner } from "@/components/ui/toast";
import { saveLegalDocumentAction } from "./actions";
import type { LegalDocument } from "@/lib/types";

export function LegalEditorForm({ doc }: { doc: LegalDocument }) {
  const [state, action] = useActionState<ActionState, FormData>(
    saveLegalDocumentAction,
    null,
  );
  useRouterRefreshOnActions(state);

  const sectionsJson = JSON.stringify(doc.sections, null, 2);

  return (
    <form action={action} className="kumbu-card space-y-4 p-5">
      <FeedbackBanner feedback={state} />
      <input type="hidden" name="slug" value={doc.slug} />

      <label className="block">
        <span className="kumbu-label">Título da página</span>
        <input
          name="title"
          defaultValue={doc.title}
          className="kumbu-input mt-1 w-full"
          required
        />
      </label>

      <label className="block">
        <span className="kumbu-label">Introdução (opcional)</span>
        <textarea
          name="intro"
          defaultValue={doc.intro ?? ""}
          className="kumbu-input mt-1 w-full min-h-[72px]"
        />
      </label>

      <label className="block">
        <span className="kumbu-label">Secções (JSON)</span>
        <p className="mb-1 text-xs text-slate-500">
          Array de {"{ title, paragraphs: string[] }"}. Valide o JSON antes de guardar.
        </p>
        <textarea
          name="sections_json"
          defaultValue={sectionsJson}
          className="kumbu-input mt-1 w-full min-h-[320px] font-mono text-xs"
          required
        />
      </label>

      <p className="text-xs text-slate-500">
        Última actualização:{" "}
        {new Date(doc.updated_at).toLocaleString("pt-PT")}
      </p>

      <button type="submit" className="kumbu-btn-primary">
        Guardar documento
      </button>
    </form>
  );
}
