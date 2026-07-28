'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isHydrated, isAuthenticated, logout } = useAuth();
  const hasHostAccess = user?.roles?.includes("host") ?? false;
  const guestPortalHref = "/guest/dashboard";

  const menuItems = useMemo(
    () =>
      isAuthenticated
        ? [
            ...(!hasHostAccess
              ? [{ label: "Guest portal", href: guestPortalHref, emphasis: true }]
              : []),
            { label: "Browse stays", href: "/" },
            hasHostAccess
              ? { label: "Host dashboard", href: "/host/dashboard", emphasis: true }
              : { label: "Become a host", href: "/host/onboarding" },
            { label: "Help Center", href: "/help" },
          ]
        : [
            { label: "Log in or sign up", href: "/auth?mode=login", emphasis: true },
            { label: "Earn by Hosting", href: "/host" },
            { label: "Help Center", href: "/help" },
            { label: "About XYZ Travellers", href: "/about" },
          ],
    [guestPortalHref, hasHostAccess, isAuthenticated],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextSearch = window.location.search;

    setCurrentSearch((current) => (current === nextSearch ? current : nextSearch));
  });

  const isMenuItemActive = (href: string) => {
    const [itemPath, itemQuery] = href.split("?");

    if (pathname !== itemPath) {
      return false;
    }

    if (!itemQuery) {
      return true;
    }

    const expectedParams = new URLSearchParams(itemQuery);
    const currentParams = new URLSearchParams(currentSearch);

    for (const [key, value] of expectedParams.entries()) {
      if (currentParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-[rgba(245,243,237,0.82)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-1">
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo href="/" variant="navbar" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={
                isAuthenticated
                  ? hasHostAccess
                    ? "/host/dashboard"
                    : guestPortalHref
                  : "/host"
              }
              className="hidden rounded-full border border-border bg-card px-4 py-2 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium md:inline-flex"
            >
              {hasHostAccess ? "Host dashboard" : isAuthenticated ? "Guest portal" : "Become a host"}
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((open) => !open)}
                className="surface-card-strong flex items-center gap-3 rounded-full px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                aria-label="Open account menu"
              >
                <svg
                  className="h-4 w-4 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-text-primary shadow-glow">
                  {isHydrated && user ? (
                    <span className="text-[12px] font-bold uppercase">
                      {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`}
                    </span>
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </span>
              </button>

              <div
                className={`absolute right-0 top-full mt-3 w-[290px] overflow-hidden rounded-panel border border-border bg-[rgba(255,255,255,0.94)] shadow-strong backdrop-blur-xl transition-all duration-250 ${
                  isDropdownOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <div className="border-b border-border/70 px-5 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Your account
                  </p>
                  {isHydrated && user ? (
                    <>
                      <p className="mt-2 text-[18px] font-semibold text-text-primary">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-text-secondary">{user.email}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                      Manage stays, hosting, and support from one place.
                    </p>
                  )}
                </div>

                <div className="space-y-1 p-3">
                  {menuItems.map((item) => (
                    (() => {
                      const isActive = isMenuItemActive(item.href);

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3 text-[14px] transition-all duration-200 focus:outline-none ${
                            isActive
                              ? "bg-primary-light font-semibold text-text-primary shadow-soft"
                              : item.emphasis
                                ? "font-semibold text-text-primary hover:bg-surface"
                                : "font-medium text-text-primary hover:bg-surface"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="text-text-secondary">→</span>
                        </Link>
                      );
                    })()
                  ))}

                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[14px] font-medium text-text-primary transition-all duration-200 hover:bg-surface"
                    >
                      <span>Log out</span>
                      <span className="text-text-secondary">→</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
