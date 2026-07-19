"use client";

import Link from "next/link";
import React from "react";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import { isHostPropertyEditable, type HostPropertySummary } from "@/lib/host";

type HostPropertyCardProps = {
  property: HostPropertySummary;
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

export const HostPropertyCard: React.FC<HostPropertyCardProps> = ({ property }) => {
  const canEdit = isHostPropertyEditable(property.status);
  const editHref = `/host/properties/${property.id}/edit`;

  return (
    <div className="surface-card rounded-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {property.propertyType || "Property draft"}
          </p>
          <h2 className="mt-3 truncate font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            {property.name || "Untitled property"}
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-text-secondary">
            {property.city || property.country
              ? [property.city, property.country].filter(Boolean).join(", ")
              : "Location details not set yet."}
          </p>
        </div>

        <HostPropertyStatusPill status={property.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Ownership</p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {property.ownershipType || "Not set"}
          </p>
        </div>
        <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Address</p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {property.address || "Draft location pending"}
          </p>
        </div>
        <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Updated</p>
          <p className="mt-2 text-[14px] font-semibold text-text-primary">
            {formatUpdatedAt(property.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={editHref}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          {canEdit ? "Continue draft" : "View details"}
        </Link>
        <Link
          href="/host/properties"
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to properties
        </Link>
      </div>
    </div>
  );
};
