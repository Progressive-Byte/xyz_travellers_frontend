"use client";

import React from "react";
import { type HostPropertyUnit } from "@/lib/host";

type HostPropertyCalendarUnitSelectorProps = {
  units: HostPropertyUnit[];
  selectedUnitId: string;
  onSelect: (unitId: string) => void;
};

export const HostPropertyCalendarUnitSelector: React.FC<HostPropertyCalendarUnitSelectorProps> = ({
  units,
  selectedUnitId,
  onSelect,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Select unit
      </p>
      <div className="mt-5 grid gap-3">
        {units.map((unit) => {
          const isSelected = unit.id === selectedUnitId;

          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => onSelect(unit.id)}
              className={`rounded-[22px] border px-4 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary/35 bg-primary-light/80 shadow-soft"
                  : "border-border-light bg-white/80 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[16px] font-semibold text-text-primary">{unit.name || "Untitled unit"}</p>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    Capacity {unit.capacity || "not set"} • Bedrooms {unit.bedrooms || "not set"}
                  </p>
                </div>
                <span className="rounded-full border border-border-light bg-card px-3 py-1.5 text-[12px] font-semibold text-text-primary">
                  {unit.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
