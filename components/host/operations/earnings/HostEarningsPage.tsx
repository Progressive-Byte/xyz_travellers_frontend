"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import {
  formatHostCurrency,
  formatHostDateTime,
  getFinanceStatusClasses,
} from "@/components/host/operations/hostOperations";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostEarningsSummary,
  getHostEarningsTransactions,
  type HostEarningsSummary,
  type HostEarningsTransaction,
} from "@/lib/host";

const EarningsSkeleton = () => (
  <HostShell badge="Operations">
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface-card rounded-panel h-32 animate-pulse bg-white/75" />
        ))}
      </div>
      <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
    </div>
  </HostShell>
);

const SummaryCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="surface-card rounded-panel p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-4 text-[20px] font-semibold text-text-primary">{value}</p>
  </div>
);

export const HostEarningsPage: React.FC = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState<HostEarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<HostEarningsTransaction[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadEarnings = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [summaryResult, transactionResults] = await Promise.all([
          getHostEarningsSummary(token),
          getHostEarningsTransactions(token),
        ]);

        if (!isActive) {
          return;
        }

        setSummary(summaryResult);
        setTransactions(transactionResults);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your earnings workspace right now."
            : "We couldn't load your earnings workspace right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadEarnings();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const currency = summary?.currency || transactions[0]?.currency || "BDT";
  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);

  if (isLoading) {
    return <EarningsSkeleton />;
  }

  return (
    <HostShell
      badge="Operations"
      title="Earnings"
      subtitle="Track net earnings, pending payouts, and transaction-level finance history from one host operations view."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Net earnings
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              {formatHostCurrency(summary?.netEarnings ?? null, currency)}
            </p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Pending payout
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              {formatHostCurrency(summary?.pendingPayout ?? null, currency)}
            </p>
          </div>
        </>
      }
    >
      {error ? (
        <div className="surface-card rounded-panel px-6 py-8">
          <p className="text-[15px] font-semibold text-text-primary">Earnings unavailable</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-text-secondary">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="mt-6 inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
          >
            Reload earnings
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <SummaryCard label="Gross revenue" value={formatHostCurrency(summary?.grossRevenue ?? null, currency)} />
            <SummaryCard label="Commission" value={formatHostCurrency(summary?.commissionTotal ?? null, currency)} />
            <SummaryCard label="Refunds" value={formatHostCurrency(summary?.refundTotal ?? null, currency)} />
            <SummaryCard label="Net earnings" value={formatHostCurrency(summary?.netEarnings ?? null, currency)} />
            <SummaryCard label="Pending payout" value={formatHostCurrency(summary?.pendingPayout ?? null, currency)} />
            <SummaryCard label="Paid out" value={formatHostCurrency(summary?.paidOut ?? null, currency)} />
          </div>

          <div className="mt-8 surface-card rounded-panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Finance history
                </p>
                <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                  Recent transactions
                </h2>
                <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
                  Keep the current revenue picture readable, then drill into payout setup for historical disbursements and payout profile changes.
                </p>
              </div>

              <Link
                href="/host/payouts"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open payout setup and history
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="mt-6 overflow-x-auto rounded-[24px] border border-border-light">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[1.25fr_1.1fr_0.95fr_0.9fr] gap-3 bg-white/85 px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    <span>Reservation</span>
                    <span>Type</span>
                    <span>Status</span>
                    <span className="text-right">Net amount</span>
                  </div>
                  <div className="divide-y divide-border-light bg-card">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="grid grid-cols-[1.25fr_1.1fr_0.95fr_0.9fr] gap-3 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-text-primary">
                            {transaction.propertyName || "Property pending"}
                          </p>
                          <p className="mt-1 text-[12px] text-text-secondary">
                            Reservation #{transaction.reservationId.slice(-6).toUpperCase()}
                          </p>
                          <p className="mt-1 text-[12px] text-text-secondary">
                            {formatHostDateTime(transaction.processedAt || transaction.createdAt)}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] text-text-primary">
                            {transaction.transactionType || "Transaction"}
                          </p>
                          <p className="mt-1 text-[12px] text-text-secondary">
                            {transaction.unitName || "Unit pending"}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold ${getFinanceStatusClasses(transaction.status)}`}
                          >
                            {transaction.status || "Unknown"}
                          </span>
                        </div>
                        <div className="text-right text-[14px] font-semibold text-text-primary">
                          {formatHostCurrency(transaction.netAmount, transaction.currency || currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-border-light bg-white/80 px-5 py-6 text-[14px] leading-7 text-text-secondary">
                No earnings transactions are available yet. Once reservations start settling, finance activity will appear here.
              </div>
            )}
          </div>
        </>
      )}
    </HostShell>
  );
};
