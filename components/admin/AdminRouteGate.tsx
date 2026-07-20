"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type AdminRouteGateProps = {
  children: React.ReactNode;
};

export const AdminRouteGate: React.FC<AdminRouteGateProps> = ({ children }) => {
  const router = useRouter();
  const { isHydrated, isAuthenticated, user, token } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !user || !token) {
      router.replace("/admin/login");
      return;
    }

    if (!user.roles.includes("admin")) {
      router.replace("/admin/login?denied=1");
    }
  }, [isAuthenticated, isHydrated, router, token, user]);

  if (!isHydrated || !isAuthenticated || !user || !token || !user.roles.includes("admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="surface-card w-full max-w-md rounded-[28px] px-6 py-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            Admin Access
          </p>
          <h1 className="mt-4 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Checking your session
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-text-secondary">
            Hold on while the admin portal confirms your access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
