"use client";


import type { ActionState } from "@/lib/action-state";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Loader2,
  Save,
  Trash2,
  KeyRound,
  ShieldCheck,
  ShieldOff,
  RotateCcw,
  Download,
  ShieldBan,
  MailCheck,
} from "lucide-react";
import {
  updateUserAction,
  deleteUserAction,
  restoreUserAction,
  banUserAction,
  unbanUserAction,
  promoteAdminAction,
  demoteAdminAction,
  sendPasswordResetAction,
  sendEmailVerificationAction,
} from "../actions";
import {
  BAN_DURATION_OPTIONS,
  formatBanStatusLabel,
  isUserCurrentlyBanned,
  type UserBanFields,
} from "@/lib/user-ban";
import { FeedbackBanner } from "@/components/ui/toast";

function Btn({
  pendingLabel,
  className,
  children,
  icon: Icon,
}: {
  pendingLabel: string;
  className: string;
  children: React.ReactNode;
  icon: typeof Save;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

export function VerifiedUserForm({
  id,
  sellerVerified,
}: {
  id: string;
  sellerVerified?: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateUserAction, null);
  return (
    <form action={action} className="kumbu-panel-success space-y-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="seller_verified" value={sellerVerified ? "false" : "true"} />
      <FeedbackBanner feedback={state} />
      <p className="kumbu-panel-title text-sm font-semibold">
        {sellerVerified ? "Utilizador verificado" : "Sem verificação"}
      </p>
      <p className="kumbu-panel-label text-xs">
        A tag «Verificado» aparece no perfil e nas conversas quando activa.
      </p>
      <Btn
        icon={ShieldCheck}
        pendingLabel="A actualizar..."
        className={sellerVerified ? "kumbu-btn-ghost" : "kumbu-btn-primary"}
      >
        {sellerVerified ? "Remover verificado" : "Marcar como verificado"}
      </Btn>
    </form>
  );
}

export function UpdateUserForm({
  user,
}: {
  user: {
    id: string;
    email: string | null;
    display_name: string | null;
    phone: string | null;
    gender?: string | null;
    birth_date?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
  };
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    updateUserAction,
    null
  );
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />
      <FeedbackBanner feedback={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" name="display_name" defaultValue={user.display_name ?? ""} />
        <Field label="Telefone" name="phone" defaultValue={user.phone ?? ""} />
        <Field
          label="E-mail (perfil público)"
          name="email"
          type="email"
          defaultValue={user.email ?? ""}
        />
        <Field label="Género" name="gender" defaultValue={user.gender ?? ""} />
        <Field
          label="Data de nascimento"
          name="birth_date"
          type="date"
          defaultValue={user.birth_date?.slice(0, 10) ?? ""}
        />
        <Field label="Cidade" name="city" defaultValue={user.city ?? ""} />
        <Field label="Região" name="region" defaultValue={user.region ?? ""} />
        <Field label="País" name="country" defaultValue={user.country ?? ""} />
      </div>
      <div>
        <Btn
          icon={Save}
          pendingLabel="A guardar..."
          className="kumbu-btn-primary"
        >
          Guardar alterações
        </Btn>
      </div>
    </form>
  );
}

export function PasswordResetForm({ email }: { email: string | null }) {
  const [state, action] = useActionState<ActionState, FormData>(
    sendPasswordResetAction,
    null
  );
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="email" value={email ?? ""} />
      <FeedbackBanner feedback={state} />
      <Btn
        icon={KeyRound}
        pendingLabel="A enviar..."
        className="kumbu-btn-ghost"
      >
        Enviar reset de palavra-passe
      </Btn>
    </form>
  );
}

export function EmailVerificationPanel({
  id,
  email,
  emailVerified,
}: {
  id: string;
  email: string | null;
  emailVerified?: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    sendEmailVerificationAction,
    null,
  );
  const verified = emailVerified === true;

  return (
    <div className="space-y-2 rounded-chip border border-slate-100 px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">Verificação de e-mail</p>
        <span
          className={`kumbu-badge text-[10px] ${
            verified
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {verified ? "Confirmado" : "Por confirmar"}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        {verified
          ? "O utilizador já confirmou o endereço de e-mail da conta."
          : email
            ? "Envia um novo link de confirmação para o e-mail da conta."
            : "Sem e-mail na conta — não é possível enviar confirmação."}
      </p>
      {!verified && email ? (
        <form action={action} className="space-y-2">
          <input type="hidden" name="id" value={id} />
          <FeedbackBanner feedback={state} />
          <Btn
            icon={MailCheck}
            pendingLabel="A enviar..."
            className="kumbu-btn-ghost"
          >
            Enviar link de verificação
          </Btn>
        </form>
      ) : null}
    </div>
  );
}

export function ExportUserButton({ userId }: { userId: string }) {
  return (
    <a
      href={`/users/${userId}/export`}
      className="kumbu-btn-ghost inline-flex items-center gap-2"
      download
    >
      <Download className="h-4 w-4" />
      Exportar JSON
    </a>
  );
}

export function BanUserForm({ id }: { id: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    banUserAction,
    null,
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Suspender este utilizador? Não poderá publicar, comprar nem enviar mensagens durante o período escolhido.",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="kumbu-panel-warning space-y-3"
    >
      <input type="hidden" name="id" value={id} />
      <FeedbackBanner feedback={state} />
      <p className="kumbu-panel-title text-sm font-semibold">Suspender utilizador</p>
      <label className="kumbu-panel-label block text-xs font-medium">
        Duração
        <select name="duration" className="kumbu-input mt-1 w-full" defaultValue="7d">
          {BAN_DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="kumbu-panel-label block text-xs font-medium">
        Motivo (opcional)
        <textarea
          name="reason"
          rows={2}
          className="kumbu-input mt-1 w-full resize-y"
          placeholder="Ex.: fraude, spam, violação das regras…"
        />
      </label>
      <Btn
        icon={ShieldBan}
        pendingLabel="A banir..."
        className="kumbu-btn-danger w-full"
      >
        Aplicar suspensão
      </Btn>
    </form>
  );
}

export function UnbanUserForm({ id, user }: { id: string; user?: UserBanFields }) {
  const [state, action] = useActionState<ActionState, FormData>(
    unbanUserAction,
    null,
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Cancelar a suspensão deste utilizador? Voltará a poder usar a plataforma.")) {
          e.preventDefault();
        }
      }}
      className="kumbu-panel-warning space-y-3 rounded-xl border p-4"
    >
      <input type="hidden" name="id" value={id} />
      <FeedbackBanner feedback={state} />
      <p className="kumbu-panel-title text-sm font-semibold">Conta suspensa</p>
      {user ? (
        <p className="kumbu-panel-label text-xs">{formatBanStatusLabel(user)}</p>
      ) : null}
      {user?.ban_reason ? (
        <p className="kumbu-panel-label text-xs">
          <span className="font-semibold">Motivo:</span> {user.ban_reason}
        </p>
      ) : null}
      <p className="kumbu-panel-label text-xs">
        O utilizador vê um aviso no site com opção de contactar o suporte. Use o botão abaixo para
        levantar a suspensão.
      </p>
      <Btn
        icon={ShieldCheck}
        pendingLabel="A cancelar suspensão…"
        className="kumbu-btn-primary w-full"
      >
        Cancelar suspensão
      </Btn>
    </form>
  );
}

export function UserBanPanel({
  id,
  user,
}: {
  id: string;
  user: UserBanFields;
}) {
  if (user.deleted_at) return null;
  if (isUserCurrentlyBanned(user)) {
    return <UnbanUserForm id={id} user={user} />;
  }
  return <BanUserForm id={id} />;
}

export function RestoreUserForm({ id }: { id: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    restoreUserAction,
    null
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Restaurar esta conta? O utilizador voltará a aparecer como activo na app."
          )
        )
          e.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <FeedbackBanner feedback={state} />
      <Btn
        icon={RotateCcw}
        pendingLabel="A restaurar..."
        className="kumbu-btn-primary w-full"
      >
        Restaurar conta eliminada
      </Btn>
    </form>
  );
}

export function DeleteUserForm({ id }: { id: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    deleteUserAction,
    null
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Eliminar este utilizador? Esta acção remove a conta de Auth e dados associados."
          )
        )
          e.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <FeedbackBanner feedback={state} />
      <Btn
        icon={Trash2}
        pendingLabel="A eliminar..."
        className="kumbu-btn-danger"
      >
        Eliminar conta
      </Btn>
    </form>
  );
}

export function PromoteAdminForm({
  id,
  email,
  isAdmin,
}: {
  id: string;
  email: string | null;
  isAdmin: boolean;
}) {
  const [promoteState, promote] = useActionState<ActionState, FormData>(
    promoteAdminAction,
    null
  );
  const [demoteState, demote] = useActionState<ActionState, FormData>(
    demoteAdminAction,
    null
  );

  if (isAdmin) {
    return (
      <form
        action={demote}
        onSubmit={(e) => {
          if (!confirm("Revogar permissões de administrador?")) e.preventDefault();
        }}
        className="space-y-2"
      >
        <input type="hidden" name="id" value={id} />
        <FeedbackBanner feedback={demoteState} />
        <Btn
          icon={ShieldOff}
          pendingLabel="A revogar..."
          className="kumbu-btn-ghost"
        >
          Revogar admin
        </Btn>
      </form>
    );
  }

  return (
    <form action={promote} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="email" value={email ?? ""} />
      <input type="hidden" name="role" value="admin" />
      <FeedbackBanner feedback={promoteState} />
      <Btn
        icon={ShieldCheck}
        pendingLabel="A promover..."
        className="kumbu-btn-primary"
      >
        Promover a admin
      </Btn>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="kumbu-input"
      />
    </label>
  );
}
