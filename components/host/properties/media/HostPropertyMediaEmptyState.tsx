"use client";

import React from "react";

type HostPropertyMediaEmptyStateProps = {
  eyebrow?: string;
  heading?: string;
  description?: string;
};

export const HostPropertyMediaEmptyState: React.FC<HostPropertyMediaEmptyStateProps> = ({
  eyebrow = "No media yet",
  heading = "Start with the first gallery image",
  description = "Strong property photos help guests trust the listing quickly. Upload your first images now, then choose the cover photo that should lead the property.",
}) => {
  return (
    <div className="surface-card rounded-panel p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
        {heading}
      </h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
        {description}
      </p>
    </div>
  );
};
