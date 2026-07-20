"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  adminNavigationGroups,
  adminNavigationItems,
  type AdminNavIcon,
  isAdminNavItemActive,
} from "@/components/admin/adminNavigation";

type AdminSidebarProps = {
  onNavigate?: () => void;
};

const AdminNavIconMark: React.FC<{ icon: AdminNavIcon; isActive: boolean }> = ({ icon, isActive }) => {
  const stroke = isActive ? "var(--color-text-primary)" : "currentColor";

  switch (icon) {
    case "dashboard":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M4 13.5L12 5l8 8.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 11.5V20h10v-8.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "applications":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M7 4h10l3 3v13H4V4h3z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 10h8M8 14h8" strokeLinecap="round" />
        </svg>
      );
    case "homepage":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          <circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="17" cy="17" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-hidden border border-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,252,247,0.94)_100%)] p-4 shadow-[0_20px_60px_rgba(26,27,18,0.08)]">
      <div className="border-b border-border-light/90 pb-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[20px] px-1 py-1 transition-all duration-200 hover:bg-white/70"
        >
          <span className="icon-chip h-11 w-11 rounded-[18px] shadow-soft">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="adminSidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-primary-hover)" />
                </linearGradient>
              </defs>
              <path
                d="M6 5.5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
                fill="url(#adminSidebarLogoGradient)"
              />
              <path d="M8 9h8M8 12h8M8 15h5" stroke="var(--color-text-primary)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>

          <span className="min-w-0">
            <span className="block font-sora text-[20px] font-bold tracking-[-0.04em] text-text-primary">
              XYZ Travellers
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Admin workspace
            </span>
          </span>
        </Link>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto py-5">
        <div className="space-y-6">
          {adminNavigationGroups.map((group) => {
            const groupItems = adminNavigationItems.filter((item) => item.group === group);

            return (
              <section key={group}>
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  {group}
                </p>

                <div className="mt-2.5 space-y-1.5">
                  {groupItems.map((item) => {
                    const isActive = isAdminNavItemActive(pathname, item.href);
                    const itemClasses = `group flex w-full items-center justify-between rounded-[18px] border px-3 py-2.5 text-left transition-all duration-200 ${
                      isActive
                        ? "border-primary/55 bg-primary-light text-text-primary shadow-soft"
                        : "border-transparent bg-transparent text-text-primary hover:border-border-light hover:bg-white/85"
                    }`;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={itemClasses}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-[14px] border transition-all duration-200 ${
                              isActive
                                ? "border-primary/50 bg-white text-text-primary"
                                : "border-border-light bg-white text-text-secondary group-hover:border-border"
                            }`}
                          >
                            <AdminNavIconMark icon={item.icon} isActive={isActive} />
                          </span>

                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold text-current">
                              {item.label}
                            </span>
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
