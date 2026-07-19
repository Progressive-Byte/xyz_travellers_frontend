"use client";

import React from "react";
import { type HostPropertyUnit } from "@/lib/host";

type HostPropertyUnitCardProps = {
  unit: HostPropertyUnit;
  disabled?: boolean;
  isDeleting?: boolean;
  onEdit: (unit: HostPropertyUnit) => void;
  onDelete: (unit: HostPropertyUnit) => void;
};

export const HostPropertyUnitCard: React.FC<HostPropertyUnitCardProps> = ({
  unit,
  disabled = false,
  isDeleting = false,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-sora text-[22px] font-bold tracking-[-0.04em] text-text-primary">
              {unit.name || "Untitled unit"}
            </h3>
            <span
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                unit.isActive
                  ? "border border-primary/30 bg-primary-light text-text-primary"
                  : "border border-border-light bg-card text-text-secondary"
              }`}
            >
              {unit.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-7 text-text-secondary">
            Keep the unit details accurate now so later pricing and calendar controls stay aligned to
            real inventory.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onEdit(unit)}
            disabled={disabled || isDeleting}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
          >
            Edit unit
          </button>
          <button
            type="button"
            onClick={() => onDelete(unit)}
            disabled={disabled || isDeleting}
            className="inline-flex items-center justify-center rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete unit"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Capacity", value: unit.capacity || "Not set" },
          { label: "Bedrooms", value: unit.bedrooms || "Not set" },
          { label: "Bathrooms", value: unit.bathrooms || "Not set" },
          { label: "Beds", value: unit.beds || "Not set" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">{item.label}</p>
            <p className="mt-2 text-[16px] font-semibold text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          Amenities
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {unit.amenities.length > 0 ? (
            unit.amenities.map((amenity) => (
              <span
                key={`${unit.id}-${amenity}`}
                className="rounded-full border border-border-light bg-card px-3 py-1.5 text-[12px] font-semibold text-text-primary"
              >
                {amenity}
              </span>
            ))
          ) : (
            <span className="text-[14px] text-text-secondary">No unit amenities selected yet.</span>
          )}
        </div>
      </div>
    </div>
  );
};
