"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type HostRouteGateMode = "portal" | "onboarding";

type HostRouteGateProps = {
  mode: HostRouteGateMode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const HostRouteGate: React.FC<HostRouteGateProps> = ({
  mode,
  children,
  fallback = null,
}) => {
  const router = useRouter();
  const { user, isHydrated, isAuthenticated } = useAuth();

  const hasHostRole = user?.roles?.includes("host") ?? false;

  let redirectTarget: string | null = null;

  if (isHydrated) {
    if (!isAuthenticated || !user) {
      redirectTarget = "/auth?mode=login&intent=host";
    } else if (mode === "portal" && !hasHostRole) {
      redirectTarget = "/host/onboarding";
    } else if (mode === "onboarding" && hasHostRole) {
      redirectTarget = "/host/dashboard";
    }
  }

  useEffect(() => {
    if (redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, router]);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  if (redirectTarget) {
    return null;
  }

  return <>{children}</>;
};
