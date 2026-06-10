"use client";

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
  type ActionState,
} from "../actions";
import {
  BAN_DURATION_OPTIONS,
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
            "Banir este utilizador? Não poderá publicar, comprar nem enviar mensagens durante o período escolhido.",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4"
    >
      <input type="hidden" name="id" value={id} />
      <FeedbackBanner feedback={state} />
      <p className="text-sm font-semibold text-amber-950">Banir utilizador</p>
      <label className="block text-xs font-medium text-amber-900">
        Duração
        <select name="duration" className="kumbu-input mt-1 w-full" defaultValue="7d">
          {BAN_DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-amber-900">
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
        Aplicar banimento
      </Btn>
    </form>
  );
}

export function UnbanUserForm({ id }: { id: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    unbanUserAction,
    null,
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Remover o banimento deste utilizador?")) e.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <FeedbackBanner feedback={state} />
      <Btn
        icon={ShieldCheck}
        pendingLabel="A remover ban…"
        className="kumbu-btn-primary w-full"
      >
        Remover banimento
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
    return <UnbanUserForm id={id} />;
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
