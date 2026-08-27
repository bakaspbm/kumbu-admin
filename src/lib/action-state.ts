export type ActionState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export type LoginState =
  | { error?: string; fields?: Record<string, string>; success?: never; redirectTo?: never; mfaRequired?: never; mfaToken?: never }
  | { success: true; redirectTo: string; error?: never; fields?: never; mfaRequired?: never; mfaToken?: never }
  | { mfaRequired: true; mfaToken: string; error?: never; success?: never; redirectTo?: never; fields?: never }
  | undefined;

export type BootstrapState =
  | { error?: string; fields?: Record<string, string>; success?: never; redirectTo?: never }
  | { success: true; redirectTo: string; error?: never; fields?: never }
  | undefined;
