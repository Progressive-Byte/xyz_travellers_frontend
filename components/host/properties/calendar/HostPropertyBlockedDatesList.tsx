"use client";

import React from "react";
import { type HostUnitBlockedDate } from "@/lib/host";

type HostPropertyBlockedDatesListProps = {
  blockedDates: HostUnitBlockedDate[];
  disabled?: boolean;
  activeUnblockId?: string | null;
  onUnblock: (blockedDate: HostUnitBlockedDate) => void;
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const end = new Date(endDate).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return startDate === endDate ? start : `${start} to ${end}`;
};

export const HostPropertyBlockedDatesList: React.FC<HostPropertyBlockedDatesListProps> = ({
  blockedDates,
  disabled = false,
  activeUnblockId = null,
  onUnblock,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Blocked dates
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Review current restrictions
          </h2>
        </div>
        <span className="rounded-full border border-border-light bg-card px-3 py-2 text-[12px] font-semibold text-text-primary">
          {blockedDates.length} blocked
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {blockedDates.length > 0 ? (
          blockedDates.map((blockedDate) => (
            <div
              key={blockedDate.id || `${blockedDate.startDate}-${blockedDate.endDate}`}
              className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-text-primary">
                    {formatDateRange(blockedDate.startDate, blockedDate.endDate)}
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                    {blockedDate.note || "Blocked without an additional note."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onUnblock(blockedDate)}
                  disabled={disabled || activeUnblockId === blockedDate.id}
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
                >
                  {activeUnblockId === blockedDate.id ? "Unblocking..." : "Unblock"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4 text-[14px] leading-6 text-text-secondary">
            No blocked dates have been added for this unit yet.
          </div>
        )}
      </div>
    </div>
  );
};
