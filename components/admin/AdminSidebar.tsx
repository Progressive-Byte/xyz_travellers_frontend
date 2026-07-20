"use client";

import Link from "next/link";
import React from "react";
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

const iconClassName = "h-[18px] w-[18px] flex-none";

const AdminNavIconSvg: React.FC<{ icon: AdminNavIcon; active: boolean }> = ({ icon, active }) => {
  const strokeClassName = active ? "text-text-primary" : "text-text-secondary";

  if (icon === "dashboard") {
    return (
      <svg className={`${iconClassName} ${strokeClassName}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h7v6H4zM13 5h7v10h-7zM4 13h7v6H4zM13 17h7v2h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "applications") {
    return (
      <svg className={`${iconClassName} ${strokeClassName}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4h10l3 3v13H4V4h3z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10h8M8 14h8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={`${iconClassName} ${strokeClassName}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-5 py-5">
      <div className="rounded-[26px] border border-border-light bg-white/85 px-4 py-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
          XYZ Travellers
        </p>
        <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
          Admin portal
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-text-secondary">
          Compact moderation and homepage control workspace.
        </p>
      </div>

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
        {adminNavigationGroups.map((group) => {
          const groupItems = adminNavigationItems.filter((item) => item.group === group);

          return (
            <div key={group}>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                {group}
              </p>

              <div className="space-y-2">
                {groupItems.map((item) => {
                  const isActive = isAdminNavItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-start gap-3 rounded-[20px] border px-3.5 py-3 transition-all duration-200 ${
                        isActive
                          ? "border-primary/50 bg-primary-light shadow-glow"
                          : "border-border-light bg-white/80 shadow-soft hover:border-text-primary/15 hover:shadow-medium"
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[14px] bg-white/80">
                        <AdminNavIconSvg icon={item.icon} active={isActive} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold text-text-primary">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-5 text-text-secondary">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
