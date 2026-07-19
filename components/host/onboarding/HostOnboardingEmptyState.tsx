"use client";

import React from "react";

type HostOnboardingEmptyStateProps = {
  actions?: React.ReactNode;
};

export const HostOnboardingEmptyState: React.FC<HostOnboardingEmptyStateProps> = ({ actions }) => {
  return (
    <div className="surface-card rounded-panel p-6 md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Start here
      </p>
      <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
        Become an approved host
      </h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
        Your account is ready, but host access still needs approval. The onboarding flow will guide
        you through identity verification and application review before the full host portal unlocks.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Prepare your identity details and contact information.",
          "Submit your host application for review.",
          "Return here to track draft, submitted, or rejected status.",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-border-light bg-white/80 px-4 py-4 text-[14px] leading-6 text-text-primary shadow-soft"
          >
            {item}
          </div>
        ))}
      </div>

      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
};
