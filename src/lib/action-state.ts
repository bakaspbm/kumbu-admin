export type ActionState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
} | null;

export type LoginState =
  | { error?: string; fields?: Record<string, string>; success?: never; redirectTo?: never }
  | { success: true; redirectTo: string; error?: never; fields?: never }
  | undefined;

export type BootstrapState =
  | { error?: string; fields?: Record<string, string>; success?: never; redirectTo?: never }
  | { success: true; redirectTo: string; error?: never; fields?: never }
  | undefined;
