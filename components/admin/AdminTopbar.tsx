"use client";

import React from "react";

type AdminTopbarProps = {
  title: string;
  subtitle: string;
  onMenuToggle: () => void;
  quickAction?: React.ReactNode;
};

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  title,
  subtitle,
  onMenuToggle,
  quickAction,
}) => {
  return (
    <header className="border-b border-border-light bg-white/80 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-sora text-[18px] font-bold tracking-[-0.03em] text-text-primary">
            {title}
          </p>
          <p className="truncate text-[12px] text-text-secondary">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {quickAction}

          <button
            type="button"
            onClick={onMenuToggle}
            className="surface-card-strong flex h-11 w-11 items-center justify-center rounded-[18px] shadow-soft"
            aria-label="Open admin navigation"
          >
            <svg
              className="h-5 w-5 text-text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
