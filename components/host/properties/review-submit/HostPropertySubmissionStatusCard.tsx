"use client";

import React from "react";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import { type HostPropertySubmissionStatus } from "@/lib/host";

type HostPropertySubmissionStatusCardProps = {
  status: HostPropertySubmissionStatus;
};

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusCopy: Record<HostPropertySubmissionStatus["status"], { title: string; body: string }> = {
  draft: {
    title: "Draft listing",
    body: "The property is still being prepared. Finish the checklist before sending it to the admin review queue.",
  },
  submitted: {
    title: "Submitted for review",
    body: "The property is now with the admin team. Keep this page as the status checkpoint while the review is in progress.",
  },
  approved: {
    title: "Approved listing",
    body: "The property has passed review. This page now serves as a record of the submission and supporting verification proof.",
  },
  rejected: {
    title: "Changes needed before resubmission",
    body: "The admin team sent this listing back for changes. Review the reason below, update the listing, and submit again once everything is corrected.",
  },
};

export const HostPropertySubmissionStatusCard: React.FC<HostPropertySubmissionStatusCardProps> = ({
  status,
}) => {
  const submittedAt = formatTimestamp(status.submittedAt);
  const updatedAt = formatTimestamp(status.updatedAt);

  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Current status
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
          {statusCopy[status.status].title}
        </h2>
        <HostPropertyStatusPill status={status.status} />
      </div>

      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        {statusCopy[status.status].body}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Submitted at</p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {submittedAt || "Not submitted yet"}
          </p>
        </div>
        <div className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Last updated</p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {updatedAt || "No update timestamp available"}
          </p>
        </div>
      </div>

      {status.rejectionReason ? (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4">
          <p className="text-[13px] font-semibold text-red-700">Rejection reason</p>
          <p className="mt-2 text-[14px] leading-6 text-red-700">{status.rejectionReason}</p>
        </div>
      ) : null}
    </div>
  );
};
