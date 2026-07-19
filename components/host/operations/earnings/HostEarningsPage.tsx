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
  const [summaryError, setSummaryError] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadEarnings = async () => {
      setIsLoading(true);
      setSummaryError("");
      setTransactionError("");

      try {
        const [summaryResult, transactionResults] = await Promise.allSettled([
          getHostEarningsSummary(token),
          getHostEarningsTransactions(token, {
            status: statusFilter || undefined,
            transactionType: transactionTypeFilter || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }),
        ]);

        if (!isActive) {
          return;
        }

        setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);
        setTransactions(transactionResults.status === "fulfilled" ? transactionResults.value : []);
        setSummaryError(
          summaryResult.status === "rejected"
            ? summaryResult.reason instanceof ApiError
              ? summaryResult.reason.message || "We couldn't load your earnings summary right now."
              : "We couldn't load your earnings summary right now."
            : "",
        );
        setTransactionError(
          transactionResults.status === "rejected"
            ? transactionResults.reason instanceof ApiError
              ? transactionResults.reason.message || "We couldn't load your finance history right now."
              : "We couldn't load your finance history right now."
            : "",
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
  }, [fromDate, retryKey, statusFilter, toDate, token, transactionTypeFilter]);

  const currency = summary?.currency || transactions[0]?.currency || "BDT";
  const recentTransactions = useMemo(() => transactions.slice(0, 12), [transactions]);
  const hasFilters = Boolean(statusFilter || transactionTypeFilter || fromDate || toDate);

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
      {summaryError ? (
        <div className="surface-card rounded-panel px-6 py-6">
          <p className="text-[15px] font-semibold text-text-primary">Summary unavailable</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-text-secondary">{summaryError}</p>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="mt-5 inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            Reload summary
          </button>
        </div>
      ) : null}

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
              Finance filters
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Focus the transaction history
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
              Filter by settlement status, finance event type, and a date range when you need a narrower operational view.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
              setTransactionTypeFilter("");
              setFromDate("");
              setToDate("");
              setRetryKey((current) => current + 1);
            }}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Transaction type
            </span>
            <select
              value={transactionTypeFilter}
              onChange={(event) => setTransactionTypeFilter(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
            >
              <option value="">All types</option>
              <option value="reservation_payment">Reservation payment</option>
              <option value="commission">Commission</option>
              <option value="refund">Refund</option>
              <option value="payout_adjustment">Payout adjustment</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              From date
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
            />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              To date
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
            />
          </label>
        </div>
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

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border-light bg-white px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
            {transactions.length} matching transaction{transactions.length === 1 ? "" : "s"}
          </span>
          {hasFilters ? (
            <span className="rounded-full bg-primary-light px-3 py-1.5 text-[12px] font-semibold text-text-primary">
              Filtered view
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
          >
            Reload transactions
          </button>
        </div>

        {transactionError ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-border bg-[rgba(184,82,82,0.05)] px-5 py-6">
            <p className="text-[15px] font-semibold text-text-primary">Finance history unavailable</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-text-secondary">
              {transactionError}
            </p>
          </div>
        ) : recentTransactions.length > 0 ? (
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
            {hasFilters
              ? "No transactions match the current finance filters. Adjust the status, type, or date range and try again."
              : "No earnings transactions are available yet. Once reservations start settling, finance activity will appear here."}
          </div>
        )}

        {transactions.length > recentTransactions.length ? (
          <p className="mt-4 text-[13px] text-text-secondary">
            Showing the latest {recentTransactions.length} matching transactions.
          </p>
        ) : null}
      </div>
    </HostShell>
  );
};
