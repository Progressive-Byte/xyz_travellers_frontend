import React from "react";
import { AuthForm } from "@/components/auth/AuthForm";

type AuthMode = "login" | "register";
type AuthIntent = "guest" | "host";

type AuthLayoutProps = {
  mode: AuthMode;
  intent: AuthIntent;
};

const contentByIntent: Record<
  AuthIntent,
  {
    badge: string;
    title: string;
    description: string;
  }
> = {
  guest: {
    badge: "Guest Access",
    title: "Welcome back",
    description: "Log in or create your account.",
  },
  host: {
    badge: "Host Access",
    title: "Host access",
    description: "Sign in or create your account to continue.",
  },
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ mode, intent }) => {
  void contentByIntent[intent];

  return (
    <section className="section-shell overflow-hidden bg-background py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl">
          <AuthForm mode={mode} intent={intent} />
        </div>
      </div>
    </section>
  );
};
