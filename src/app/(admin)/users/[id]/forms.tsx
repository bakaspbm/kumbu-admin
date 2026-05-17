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
} from "lucide-react";
import {
  updateUserAction,
  deleteUserAction,
  promoteAdminAction,
  demoteAdminAction,
  sendPasswordResetAction,
  type ActionState,
} from "../actions";
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
