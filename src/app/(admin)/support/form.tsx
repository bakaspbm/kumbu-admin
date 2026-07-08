"use client";

import type { ActionState } from "@/lib/action-state";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Save } from "lucide-react";
import { saveSupportAction } from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { SupportQuickAction, SupportSettings } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="kumbu-btn-primary" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Guardar
    </button>
  );
}

function parseQuickActions(raw: SupportQuickAction[] | undefined): SupportQuickAction[] {
  if (!raw?.length) return [{ id: "faq_1", label: "", answer: "", keywords: [] }];
  return raw.map((action, index) => ({
    id: action.id || `faq_${index + 1}`,
    label: action.label ?? "",
    answer: action.answer ?? "",
    keywords: action.keywords ?? [],
    escalate: action.escalate === true,
  }));
}

export function SupportForm({ settings }: { settings: SupportSettings | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSupportAction, null);
  const seed = useMemo(() => parseQuickActions(settings?.quick_actions), [settings?.quick_actions]);
  const [faqs, setFaqs] = useState(seed);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={settings?.id ?? "default"} />
      <FeedbackBanner feedback={state} />

      <label className="flex items-center gap-3 rounded-chip border border-slate-200 px-4 py-3">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={settings?.enabled !== false}
          className="h-4 w-4 rounded border-slate-300 text-kumbu-red"
        />
        <span>
          <span className="block text-sm font-semibold text-kumbu-ink">Suporte activo</span>
          <span className="block text-xs text-slate-500">
            Desligue para mostrar apenas a mensagem temporária offline na app.
          </span>
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="kumbu-label">Mensagem offline (suporte desligado)</span>
        <textarea
          name="offline_message"
          defaultValue={
            settings?.offline_message ??
            "O suporte está temporariamente indisponível. Indique o seu número de telefone na mensagem e entraremos em contacto assim que possível."
          }
          rows={3}
          className="kumbu-input"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="kumbu-label">Mensagem de boas-vindas</span>
        <textarea
          name="welcome_message"
          defaultValue={settings?.welcome_message ?? ""}
          rows={3}
          className="kumbu-input"
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="kumbu-label">Resposta automática (escalonamento humano)</span>
        <textarea
          name="auto_reply_message"
          defaultValue={settings?.auto_reply_message ?? ""}
          rows={3}
          className="kumbu-input"
        />
      </label>

      <div className="space-y-3">
        <div>
          <p className="kumbu-label">Perguntas e respostas (bot)</p>
          <p className="text-xs text-slate-500">
            O cliente clica na pergunta e recebe a resposta pronta na app.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => (
            <div key={`faq-${index}`} className="rounded-card border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                FAQ #{index + 1}
              </p>
              <label className="block space-y-1">
                <span className="kumbu-label">Pergunta (botão)</span>
                <input
                  name={`faq_label_${index}`}
                  defaultValue={item.label}
                  className="kumbu-input"
                  placeholder="Ex.: Como comprar?"
                />
              </label>
              <label className="block space-y-1">
                <span className="kumbu-label">Resposta automática</span>
                <textarea
                  name={`faq_answer_${index}`}
                  defaultValue={item.answer}
                  rows={3}
                  className="kumbu-input"
                />
              </label>
              <label className="block space-y-1">
                <span className="kumbu-label">Palavras-chave (separadas por vírgula)</span>
                <input
                  name={`faq_keywords_${index}`}
                  defaultValue={(item.keywords ?? []).join(", ")}
                  className="kumbu-input"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`faq_escalate_${index}`}
                  defaultChecked={item.escalate === true}
                  className="h-4 w-4 rounded border-slate-300 text-kumbu-red"
                />
                Escalar para agente humano após esta opção
              </label>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="kumbu-btn-secondary text-sm"
          onClick={() =>
            setFaqs((prev) => [
              ...prev,
              { id: `faq_${prev.length + 1}`, label: "", answer: "", keywords: [] },
            ])
          }
        >
          <Plus className="mr-1 inline h-4 w-4" />
          Adicionar pergunta
        </button>
      </div>

      <Submit />
    </form>
  );
}
