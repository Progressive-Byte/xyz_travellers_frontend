'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const menuItems = [
  { label: "Log in or sign up", href: "/login", emphasis: true },
  { label: "Earn by Hosting", href: "/host" },
  { label: "Help Center", href: "/help" },
  { label: "About XYZ Travellers", href: "/about" },
];

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-[rgba(245,243,237,0.82)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="icon-chip h-11 w-11 rounded-2xl shadow-soft">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="navbarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="var(--color-primary-hover)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
                    fill="url(#navbarLogoGradient)"
                  />
                  <path d="M10 14H14V17H10V14Z" fill="var(--color-text-primary)" />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block font-sora text-[27px] font-bold tracking-[-0.04em] text-text-primary">
                  XYZ Travellers
                </span>
                <span className="hidden text-[11px] font-medium tracking-[0.18em] text-text-secondary md:block">
                  STAY BETTER IN BANGLADESH
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/host"
              className="hidden rounded-full border border-border bg-card px-4 py-2 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium md:inline-flex"
            >
              Become a host
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
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
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
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                    Manage stays, hosting, and support from one place.
                  </p>
                </div>

                <div className="space-y-1 p-3">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-[14px] transition-all duration-200 ${
                        item.emphasis
                          ? "bg-primary-light font-semibold text-text-primary hover:bg-primary"
                          : "font-medium text-text-primary hover:bg-surface"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-text-secondary">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
