"use client";

import React from "react";
import { type HostBusiness } from "@/lib/host";

type HostBusinessCardProps = {
  business: HostBusiness;
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const HostBusinessCard: React.FC<HostBusinessCardProps> = ({
  business,
  isSelected,
  isDeleting,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`rounded-[22px] border px-5 py-5 ${
        isSelected ? "border-primary/40 bg-primary-light/75" : "border-border-light bg-white/85"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            {business.status || "Business profile"}
          </p>
          <h3 className="mt-3 text-[18px] font-semibold text-text-primary">{business.name}</h3>
          <div className="mt-3 space-y-1 text-[14px] leading-6 text-text-secondary">
            {business.registrationNumber ? <p>Registration: {business.registrationNumber}</p> : null}
            {business.country ? <p>Country: {business.country}</p> : null}
            {business.address ? <p>{business.address}</p> : null}
            {business.note ? <p>{business.note}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            {isSelected ? "Viewing documents" : "Open documents"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-[16px] border border-red-200 bg-red-50/80 px-4 py-2.5 text-[13px] font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
