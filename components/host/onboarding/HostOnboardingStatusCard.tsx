"use client";

import React from "react";

type HostOnboardingStatusCardProps = {
  badge: string;
  title: string;
  description: string;
  accent?: "neutral" | "success" | "warning" | "danger";
  note?: string;
  rejectionReason?: string | null;
  actions?: React.ReactNode;
};

const accentClasses: Record<NonNullable<HostOnboardingStatusCardProps["accent"]>, string> = {
  neutral: "border-border-light bg-card",
  success: "border-primary/40 bg-primary-light/70",
  warning: "border-border bg-surface",
  danger: "border-red-200 bg-red-50/80",
};

export const HostOnboardingStatusCard: React.FC<HostOnboardingStatusCardProps> = ({
  badge,
  title,
  description,
  accent = "neutral",
  note,
  rejectionReason,
  actions,
}) => {
  return (
    <div className={`rounded-panel border p-6 shadow-soft md:p-7 ${accentClasses[accent]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        {badge}
      </p>
      <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">{description}</p>

      {rejectionReason ? (
        <div className="mt-5 rounded-[22px] border border-red-200 bg-white/70 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Rejection reason
          </p>
          <p className="mt-2 text-[14px] leading-6 text-text-primary">{rejectionReason}</p>
        </div>
      ) : null}

      {note ? (
        <div className="mt-5 rounded-[22px] border border-border-light bg-white/80 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Next step
          </p>
          <p className="mt-2 text-[14px] leading-6 text-text-primary">{note}</p>
        </div>
      ) : null}

      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
};
