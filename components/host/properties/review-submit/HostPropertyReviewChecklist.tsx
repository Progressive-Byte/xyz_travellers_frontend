"use client";

import Link from "next/link";
import React from "react";
import {
  type HostPropertySubmissionChecklist,
  type HostPropertySubmissionChecklistItem,
} from "@/lib/host";

type HostPropertyReviewChecklistProps = {
  propertyId: string;
  checklist: HostPropertySubmissionChecklist;
};

const getChecklistHref = (propertyId: string, item: HostPropertySubmissionChecklistItem) => {
  if (item.key === "basics" || item.key === "location") {
    return `/host/properties/${propertyId}/edit`;
  }

  if (item.key === "cover-image" || item.key === "media") {
    return `/host/properties/${propertyId}/media`;
  }

  if (item.key === "units") {
    return `/host/properties/${propertyId}/units`;
  }

  if (item.key === "pricing") {
    return `/host/properties/${propertyId}/pricing`;
  }

  if (item.key === "calendar") {
    return `/host/properties/${propertyId}/calendar`;
  }

  return `/host/properties/${propertyId}/verification`;
};

export const HostPropertyReviewChecklist: React.FC<HostPropertyReviewChecklistProps> = ({
  propertyId,
  checklist,
}) => {
  const missingCount = checklist.items.filter((item) => !item.isComplete).length;

  return (
    <div className="surface-card rounded-panel p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Submission checklist
          </p>
          <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            See what is ready before submission
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-text-secondary">
            This checklist only marks requirements the page can actually confirm from the current
            property, media, units, pricing, calendar, and verification data.
          </p>
        </div>

        <div className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
            Submission state
          </p>
          <p className="mt-2 text-[18px] font-semibold text-text-primary">
            {checklist.isComplete ? "Ready to submit" : `${missingCount} item${missingCount === 1 ? "" : "s"} missing`}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {checklist.items.map((item) => (
          <div
            key={item.key}
            className={`rounded-[22px] border px-5 py-5 ${
              item.isComplete
                ? "border-primary/30 bg-primary-light/70"
                : "border-red-200 bg-red-50/70"
            }`}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {item.isComplete ? "Ready" : "Needs attention"}
                </p>
                <h3 className="mt-3 text-[16px] font-semibold text-text-primary">{item.label}</h3>
                <p className="mt-2 text-[14px] leading-6 text-text-secondary">{item.description}</p>
              </div>

              {!item.isComplete ? (
                <Link
                  href={getChecklistHref(propertyId, item)}
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Open step
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
