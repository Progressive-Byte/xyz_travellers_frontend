"use client";

import Link from "next/link";
import React from "react";

type HostSetupPromptCardProps = {
  badge: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export const HostSetupPromptCard: React.FC<HostSetupPromptCardProps> = ({
  badge,
  title,
  description,
  href,
  ctaLabel,
}) => {
  return (
    <div className="surface-card rounded-panel p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        {badge}
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        {title}
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-text-secondary">{description}</p>

      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
};
