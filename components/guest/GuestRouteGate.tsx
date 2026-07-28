"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type GuestRouteGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const buildGuestAuthHref = (returnTo: string) => {
  const params = new URLSearchParams({
    mode: "login",
  });

  if (returnTo) {
    params.set("returnTo", returnTo);
  }

  return `/auth?${params.toString()}`;
};

export const GuestRouteGate: React.FC<GuestRouteGateProps> = ({
  children,
  fallback = null,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isHydrated, isAuthenticated } = useAuth();

  const redirectTarget = useMemo(() => {
    if (!isHydrated) {
      return null;
    }

    if (!isAuthenticated || !user) {
      const query = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
      const returnTo = query ? `${pathname}?${query}` : pathname;
      return buildGuestAuthHref(returnTo);
    }

    if (user.roles.includes("admin")) {
      return "/admin";
    }

    return null;
  }, [isAuthenticated, isHydrated, pathname, user]);

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
