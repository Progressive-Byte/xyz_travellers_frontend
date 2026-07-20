"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { loginAdmin } from "@/lib/admin";

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

type AdminLoginPageProps = {
  denied?: boolean;
};

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ denied = false }) => {
  const router = useRouter();
  const { isHydrated, isAuthenticated, user, setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isAuthenticated && user?.roles.includes("admin")) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isHydrated, router, user]);

  const helperMessage = useMemo(() => {
    if (denied) {
      return "Your current session does not have admin access. Sign in with an admin account.";
    }

    return "Use the dedicated admin credentials for moderation and homepage curation access.";
  }, [denied]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Enter both admin email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginAdmin({
        email,
        password,
      });

      setSession(session);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Admin login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center">
        <div className="mx-auto grid w-full max-w-2xl gap-6">
          <section className="surface-card rounded-[32px] px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
              Sign In
            </p>
            <h2 className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
              Enter admin credentials
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-text-secondary">{helperMessage}</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className={inputClassName}
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-text-primary">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className={inputClassName}
                  autoComplete="current-password"
                />
              </label>

              {errorMessage ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in to admin portal"}
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-border-light bg-surface px-4 py-4 text-[13px] leading-6 text-text-secondary">
              Need the public site instead?{" "}
              <Link href="/" className="font-semibold text-text-primary underline underline-offset-4">
                Back to homepage
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
