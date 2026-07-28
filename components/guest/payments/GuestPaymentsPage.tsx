"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getGuestPropertyLookups,
  getGuestTransactions,
  type GuestTransaction,
} from "@/lib/guest";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string | null) => {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getTransactionStatusClasses = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "settled" || normalized === "paid") {
    return "bg-[rgba(64,145,108,0.14)] text-[rgb(35,92,69)]";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "bg-primary-light text-text-primary";
  }

  if (normalized === "failed" || normalized === "reversed") {
    return "bg-[rgba(184,82,82,0.12)] text-[rgb(140,50,50)]";
  }

  return "bg-white text-text-secondary";
};

const PaymentsSkeleton = () => (
  <GuestShell badge="Payments">
    <div className="surface-card overflow-hidden rounded-panel">
      <div className="h-44 animate-pulse bg-white/75" />
      <div className="h-[420px] animate-pulse border-t border-border-light bg-white/70" />
    </div>
  </GuestShell>
);

export const GuestPaymentsPage: React.FC = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<GuestTransaction[]>([]);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadPayments = async () => {
      setIsLoading(true);
      setError("");

      try {
        const paymentResults = await getGuestTransactions(token);
        const propertyIds = Array.from(new Set(paymentResults.map((item) => item.propertyId).filter(Boolean)));
        const lookups = await getGuestPropertyLookups(propertyIds);

        if (!isActive) {
          return;
        }

        setTransactions(paymentResults);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your payment activity right now."
            : "We couldn't load your payment activity right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const settledCount = useMemo(
    () =>
      transactions.filter((item) => {
        const normalized = item.status.trim().toLowerCase();
        return normalized === "settled" || normalized === "paid";
      }).length,
    [transactions],
  );

  if (isLoading) {
    return <PaymentsSkeleton />;
  }

  return (
    <GuestShell
      badge="Payments"
      topbarAction={
        <Link
          href="/guest/bookings"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          View bookings
        </Link>
      }
    >
      <div className="surface-card overflow-hidden rounded-panel">
        <div className="p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Payment workspace
            </p>
            <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Track settled payments and booking charges
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Confirmed bookings can be paid from booking details. Every successful payment shows up here.
            </p>
          </div>

          <div className="mt-5 border-t border-border-light pt-5">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-[18px] border border-border-light bg-card px-4 py-3 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Transactions
                </p>
                <p className="mt-2 text-[20px] font-semibold text-text-primary">{transactions.length}</p>
              </div>
              <div className="rounded-[18px] border border-border-light bg-card px-4 py-3 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Settled
                </p>
                <p className="mt-2 text-[20px] font-semibold text-text-primary">{settledCount}</p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="border-t border-border-light bg-[rgba(180,35,24,0.04)] px-5 py-4">
            <p className="text-[14px] leading-6 text-[var(--color-danger,#b42318)]">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Retry
            </button>
          </div>
        ) : transactions.length ? (
          <div className="overflow-x-auto border-t border-border-light">
            <table className="min-w-[980px] w-full border-collapse">
              <thead className="bg-[rgba(245,243,237,0.92)]">
                <tr className="border-b border-border-light">
                  {["Booking", "Type", "Amount", "Status", "Processed", "Action"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const property = propertyLookup[transaction.propertyId];

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-border-light last:border-b-0 odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="min-w-0 max-w-[320px]">
                          <p className="truncate text-[14px] font-semibold text-text-primary">
                            {property?.propertyTitle ||
                              `Booking ${transaction.reservationId.slice(-6).toUpperCase()}`}
                          </p>
                          <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                            {property?.unitNamesById[transaction.unitId] || "Selected unit"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                        {transaction.transactionType || "reservation_payment"}
                      </td>
                      <td className="px-4 py-3.5 align-middle text-[13px] font-semibold text-text-primary">
                        {formatCurrency(transaction.grossAmount ?? 0, transaction.currency || "BDT")}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase ${getTransactionStatusClasses(transaction.status)}`}
                        >
                          {transaction.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                        {formatDate(transaction.processedAt || transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <Link
                          href={`/guest/bookings/${transaction.reservationId}`}
                          className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                        >
                          Open booking
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-border-light px-5 py-10 text-center">
            <p className="text-[15px] font-semibold text-text-primary">No payment records yet</p>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Once a confirmed booking is paid, the settled transaction will appear here.
            </p>
            <Link
              href="/guest/bookings"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Open bookings
            </Link>
          </div>
        )}
      </div>
    </GuestShell>
  );
};
