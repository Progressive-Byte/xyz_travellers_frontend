"use client";

import Link from "next/link";
import React from "react";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import { isHostPropertyEditable, type HostPropertySummary } from "@/lib/host";

type HostPropertyCardProps = {
  property: HostPropertySummary;
  isDeleting?: boolean;
  onDelete?: (property: HostPropertySummary) => Promise<void>;
};

const formatUpdatedAt = (value: string | null) => {
  if (!value) {
    return "Recently updated";
  }

  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const HostPropertyCard: React.FC<HostPropertyCardProps> = ({
  property,
  isDeleting = false,
  onDelete,
}) => {
  const canEdit = isHostPropertyEditable(property.status);
  const editHref = canEdit
    ? `/host/properties/${property.id}/continue`
    : `/host/properties/${property.id}/verification`;

  return (
    <div className="surface-card rounded-[24px] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {property.propertyType || "Property draft"}
          </p>
          <h2 className="mt-2.5 truncate font-sora text-[22px] font-bold tracking-[-0.04em] text-text-primary">
            {property.name || "Untitled property"}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-text-secondary">
            {property.city || property.country
              ? [property.city, property.country].filter(Boolean).join(", ")
              : "Location details not set yet."}
          </p>
        </div>

        <HostPropertyStatusPill status={property.status} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[16px] border border-border-light bg-white/80 px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Ownership</p>
          <p className="mt-1.5 text-[13px] font-semibold text-text-primary">
            {property.ownershipType || "Not set"}
          </p>
        </div>
        <div className="rounded-[16px] border border-border-light bg-white/80 px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Address</p>
          <p className="mt-1.5 text-[13px] font-semibold text-text-primary">
            {property.address || "Draft location pending"}
          </p>
        </div>
        <div className="rounded-[16px] border border-border-light bg-white/80 px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Updated</p>
          <p className="mt-1.5 text-[13px] font-semibold text-text-primary">
            {formatUpdatedAt(property.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={editHref}
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          {canEdit ? (property.status === "rejected" ? "Fix listing" : "Continue draft") : "View details"}
        </Link>
        {canEdit && onDelete ? (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Delete this property draft? This also removes its media, units, calendars, pricing, and verification files.",
                )
              ) {
                void onDelete(property);
              }
            }}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-[16px] border border-red-200 bg-red-50/80 px-4 py-2.5 text-[13px] font-semibold text-[rgb(140,50,50)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete property"}
          </button>
        ) : null}
        <Link
          href={`/host/properties/${property.id}/verification`}
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Verification
        </Link>
      </div>
    </div>
  );
};
