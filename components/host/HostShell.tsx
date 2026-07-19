"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HostSidebar } from "@/components/host/HostSidebar";
import { HostTopbar } from "@/components/host/HostTopbar";
import { getHostPageMeta } from "@/components/host/hostNavigation";
import { useAuth } from "@/context/AuthContext";

type HostShellProps = {
  children: React.ReactNode;
  badge?: string;
  title?: string;
  subtitle?: string;
  headerAside?: React.ReactNode;
  topbarAction?: React.ReactNode;
};

export const HostShell: React.FC<HostShellProps> = ({
  children,
  badge = "Host Portal",
  title,
  subtitle,
  headerAside,
  topbarAction,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pageMeta = getHostPageMeta(pathname);

  const resolvedTitle = title ?? pageMeta.title;
  const resolvedSubtitle = subtitle ?? pageMeta.subtitle;
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() || "H"
    : "H";

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden lg:block lg:w-[312px] lg:flex-none lg:border-r lg:border-border-light lg:bg-[linear-gradient(180deg,rgba(255,252,247,0.9)_0%,rgba(240,238,231,0.72)_100%)]">
          <div className="sticky top-0 h-screen">
            <HostSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <HostTopbar
            title={resolvedTitle}
            subtitle={resolvedSubtitle}
            onMenuToggle={() => setIsSidebarOpen(true)}
            quickAction={topbarAction}
          />

          <main className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">
            <div className="mx-auto w-full max-w-7xl">
              <div className="surface-card mb-4 rounded-[24px] px-4 py-3.5 sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[13px] font-bold uppercase text-text-primary shadow-glow">
                      {initials}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-text-primary">
                        {user ? `${user.firstName} ${user.lastName}` : "Host account"}
                      </p>
                      <p className="truncate text-[12px] text-text-secondary">
                        {user?.email ?? "Signed in to the host workspace"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3.5 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      Back to homepage
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center rounded-[16px] bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>

              <div className="surface-card-strong rounded-panel p-5 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span className="section-badge">{badge}</span>
                    <h1 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.05em] text-text-primary md:text-[34px]">
                      {resolvedTitle}
                    </h1>
                    {resolvedSubtitle ? (
                      <p className="mt-2.5 max-w-2xl text-[14px] leading-6 text-text-secondary">
                        {resolvedSubtitle}
                      </p>
                    ) : null}
                  </div>

                  {headerAside ? <div className="grid gap-2.5 sm:grid-cols-2">{headerAside}</div> : null}
                </div>
              </div>

              <div className="mt-6">{children}</div>
            </div>
          </main>
        </div>
      </div>

      <div
        className={`lg:hidden ${
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <div
          className={`fixed inset-0 z-40 bg-[rgba(26,27,18,0.32)] backdrop-blur-[2px] transition-opacity duration-200 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 z-50 w-[min(88vw,340px)] p-4 transition-transform duration-250 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Host navigation"
        >
          <div className="flex h-full flex-col">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="surface-card-strong flex h-11 w-11 items-center justify-center rounded-[18px] shadow-soft"
                aria-label="Close host navigation"
              >
                <svg
                  className="h-5 w-5 text-text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <HostSidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
};
