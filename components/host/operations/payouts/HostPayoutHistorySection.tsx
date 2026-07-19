"use client";

import React from "react";
import {
  formatHostCurrency,
  formatHostDate,
  getFinanceStatusClasses,
} from "@/components/host/operations/hostOperations";
import { type HostPayoutHistoryItem } from "@/lib/host";

type HostPayoutHistorySectionProps = {
  items: HostPayoutHistoryItem[];
  selectedPayout: HostPayoutHistoryItem | null;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onSelect: (payoutId: string) => void;
};

const DetailCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">{label}</p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

export const HostPayoutHistorySection: React.FC<HostPayoutHistorySectionProps> = ({
  items,
  selectedPayout,
  isLoading,
  error,
  onRetry,
  onSelect,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Operations history
          </p>
          <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Payout history
          </h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
            Historical payouts stay separate from payout setup so hosts can review past disbursements without confusing them with editable payout instructions.
          </p>
        </div>
        <span className="rounded-full border border-border-light bg-white px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
          {items.length} record{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {error ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-border bg-[rgba(184,82,82,0.05)] px-5 py-6">
          <p className="text-[15px] font-semibold text-text-primary">Payout history unavailable</p>
          <p className="mt-2 max-w-2xl text-[14px] leading-7 text-text-secondary">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
          >
            Reload payout history
          </button>
        </div>
      ) : isLoading ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[24px] bg-white/75" />
            ))}
          </div>
          <div className="h-[320px] animate-pulse rounded-[24px] bg-white/75" />
        </div>
      ) : items.length > 0 ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            {items.map((item) => {
              const isActive = selectedPayout?.id === item.id;
              const currency = item.currency || "BDT";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full rounded-[24px] border px-5 py-5 text-left shadow-soft transition-all duration-200 ${
                    isActive
                      ? "border-primary/55 bg-primary-light"
                      : "border-border-light bg-white/85 hover:-translate-y-0.5 hover:border-text-primary/15 hover:shadow-medium"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-text-primary">
                        {item.reference || `Payout ${item.id.slice(-6).toUpperCase()}`}
                      </p>
                      <p className="mt-1 text-[13px] text-text-secondary">
                        {formatHostDate(item.periodStart)} to {formatHostDate(item.periodEnd)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${getFinanceStatusClasses(item.status)}`}
                    >
                      {item.status || "Unknown"}
                    </span>
                  </div>
                  <p className="mt-4 text-[16px] font-semibold text-text-primary">
                    {formatHostCurrency(item.netAmount, currency)}
                  </p>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    Paid at {formatHostDate(item.paidAt)}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-border-light bg-white/85 p-5 shadow-soft">
            {selectedPayout ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Selected payout
                    </p>
                    <h3 className="mt-3 text-[20px] font-semibold text-text-primary">
                      {selectedPayout.reference || `Payout ${selectedPayout.id.slice(-6).toUpperCase()}`}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${getFinanceStatusClasses(selectedPayout.status)}`}
                  >
                    {selectedPayout.status || "Unknown"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    label="Gross amount"
                    value={formatHostCurrency(selectedPayout.grossAmount, selectedPayout.currency)}
                  />
                  <DetailCard
                    label="Commission"
                    value={formatHostCurrency(selectedPayout.commissionAmount, selectedPayout.currency)}
                  />
                  <DetailCard
                    label="Refunds"
                    value={formatHostCurrency(selectedPayout.refundAmount, selectedPayout.currency)}
                  />
                  <DetailCard
                    label="Net paid"
                    value={formatHostCurrency(selectedPayout.netAmount, selectedPayout.currency)}
                  />
                  <DetailCard label="Created" value={formatHostDate(selectedPayout.createdAt)} />
                  <DetailCard label="Paid at" value={formatHostDate(selectedPayout.paidAt)} />
                </div>

                <div className="mt-5 rounded-[20px] border border-border-light bg-white/90 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Notes</p>
                  <p className="mt-2 text-[14px] leading-7 text-text-primary">
                    {selectedPayout.notes || "No extra payout note was returned for this record."}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-[20px] border border-dashed border-border-light bg-white/90 px-4 py-6 text-[14px] leading-7 text-text-secondary">
                Select a payout record to inspect the final amounts and release note.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-dashed border-border-light bg-white/80 px-5 py-6 text-[14px] leading-7 text-text-secondary">
          No payout history is available yet. Past disbursements will appear here once earnings progress into paid payout records.
        </div>
      )}
    </div>
  );
};
