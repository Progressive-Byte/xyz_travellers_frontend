"use client";

import React from "react";
import { type HostPropertyStatus } from "@/lib/host";

type HostPropertyStatusPillProps = {
  status: HostPropertyStatus;
};

const statusClasses: Record<HostPropertyStatus, string> = {
  draft: "border-primary/30 bg-primary-light text-text-primary",
  submitted: "border-border bg-surface text-text-primary",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const statusLabels: Record<HostPropertyStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export const HostPropertyStatusPill: React.FC<HostPropertyStatusPillProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};
