"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding/BrandLogo";
import {
  hostNavigationGroups,
  hostNavigationItems,
  isHostNavItemActive,
  type HostNavIcon,
} from "@/components/host/hostNavigation";

type HostSidebarProps = {
  onNavigate?: () => void;
};

const HostNavIconMark: React.FC<{ icon: HostNavIcon; isActive: boolean }> = ({ icon, isActive }) => {
  const stroke = isActive ? "var(--color-text-primary)" : "currentColor";

  switch (icon) {
    case "dashboard":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M4 13.5L12 5l8 8.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 11.5V20h10v-8.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "properties":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M4 20h16" strokeLinecap="round" />
          <path d="M6 20V9l6-4 6 4v11" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14h4v6h-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "reservations":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="14" rx="3" strokeLinecap="round" />
          <path d="M8 4v4M16 4v4M4 10h16" strokeLinecap="round" />
        </svg>
      );
    case "messages":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M6 7h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 3V9a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 11h8M8 14h5" strokeLinecap="round" />
        </svg>
      );
    case "reviews":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 4.5l1.9 3.85 4.25.62-3.08 3 0.73 4.23L12 14.2 8.2 16.2l0.73-4.23-3.08-3 4.25-.62L12 4.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "earnings":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 4v16" strokeLinecap="round" />
          <path d="M16.5 7.5c0-1.7-1.9-3-4.5-3s-4.5 1.3-4.5 3 1.9 3 4.5 3 4.5 1.3 4.5 3-1.9 3-4.5 3-4.5-1.3-4.5-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "businesses":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M4 20h16" strokeLinecap="round" />
          <path d="M6 20V8h12v12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 8V5h6v3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" strokeLinecap="round" />
        </svg>
      );
    case "verification":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 4 6 6.5v5.3c0 3.5 2.1 6.7 6 8.2 3.9-1.5 6-4.7 6-8.2V6.5L12 4Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m9.4 12.1 1.7 1.7 3.7-3.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "profile":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" strokeLinecap="round" />
          <path d="M5 19.5c1.9-2.6 4.3-3.9 7-3.9s5.1 1.3 7 3.9" strokeLinecap="round" />
        </svg>
      );
    case "payouts":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="12" rx="3" strokeLinecap="round" />
          <path d="M4 10h16" strokeLinecap="round" />
          <path d="M8 14h4" strokeLinecap="round" />
          <path d="M15.5 15.5h.01" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export const HostSidebar: React.FC<HostSidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-hidden border border-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,252,247,0.94)_100%)] p-4 shadow-[0_20px_60px_rgba(26,27,18,0.08)]">
      <div className="border-b border-border-light/90 pb-4">
        <BrandLogo href="/" onClick={onNavigate} subtitle="Host workspace" variant="sidebar" />
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto py-5">
        <div className="space-y-6">
          {hostNavigationGroups.map((group) => {
            const groupItems = hostNavigationItems.filter((item) => item.group === group);

            return (
              <section key={group}>
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  {group}
                </p>

                <div className="mt-2.5 space-y-1.5">
                  {groupItems.map((item) => {
                    const isActive = isHostNavItemActive(pathname, item.href);
                    const itemClasses = `group flex w-full items-center justify-between rounded-[18px] border px-3 py-2.5 text-left transition-all duration-200 ${
                      isActive
                        ? "border-primary/55 bg-primary-light text-text-primary shadow-soft"
                        : item.isLive
                          ? "border-transparent bg-transparent text-text-primary hover:border-border-light hover:bg-white/85"
                          : "border-transparent bg-transparent text-text-secondary/85"
                    }`;

                    const content = (
                      <>
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-[14px] border transition-all duration-200 ${
                              isActive
                                ? "border-primary/50 bg-white text-text-primary"
                                : item.isLive
                                  ? "border-border-light bg-white text-text-secondary group-hover:border-border"
                                  : "border-border-light bg-white/70 text-text-secondary"
                            }`}
                          >
                            <HostNavIconMark icon={item.icon} isActive={isActive} />
                          </span>

                          <span className="min-w-0">
                            <span
                              className={`block text-[13px] ${
                                isActive || item.isLive
                                  ? "font-semibold text-current"
                                  : "font-medium text-current"
                              }`}
                            >
                              {item.label}
                            </span>
                            {item.isLive ? null : (
                              <span className="mt-0.5 block text-[11px] leading-4 text-text-secondary">
                                Coming soon
                              </span>
                            )}
                          </span>
                        </span>

                        {!item.isLive ? (
                          <span className="rounded-full border border-border-light bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                            Soon
                          </span>
                        ) : null}
                      </>
                    );

                    if (!item.isLive) {
                      return (
                        <button
                          key={item.label}
                          type="button"
                          disabled
                          aria-disabled="true"
                          className={itemClasses}
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onNavigate}
                        className={itemClasses}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {content}
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
