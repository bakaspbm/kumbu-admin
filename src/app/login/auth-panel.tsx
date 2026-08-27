"use client";

import { LoginForm } from "./login-form";

export function AuthPanel({ next }: { next: string }) {
  return <LoginForm next={next} />;
}
