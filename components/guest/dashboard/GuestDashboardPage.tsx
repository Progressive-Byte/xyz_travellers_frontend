"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GuestShell } from "@/components/guest/GuestShell";
import { GuestBookingStatusPill } from "@/components/guest/bookings/GuestBookingStatusPill";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getGuestDashboard,
  getGuestPropertyLookups,
  type GuestDashboardData,
} from "@/lib/guest";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const MetricCard: React.FC<{ label: string; value: number; helper: string }> = ({
  label,
  value,
  helper,
}) => (
  <div className="surface-card rounded-panel p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
      {value}
    </p>
    <p className="mt-2 text-[14px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

const DashboardSkeleton = () => (
  <GuestShell badge="Guest Portal">
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card h-32 animate-pulse rounded-panel bg-white/75" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="surface-card h-[360px] animate-pulse rounded-panel bg-white/75" />
        <div className="surface-card h-[360px] animate-pulse rounded-panel bg-white/75" />
      </div>
    </div>
  </GuestShell>
);

export const GuestDashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<GuestDashboardData | null>(null);
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

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const dashboardData = await getGuestDashboard(token);
        const propertyIds = Array.from(
          new Set([
            ...dashboardData.bookings.upcoming.map((item) => item.propertyId),
            ...dashboardData.payments.recentTransactions.map((item) => item.propertyId),
          ]),
        );
        const lookups = await getGuestPropertyLookups(propertyIds);

        if (!isActive) {
          return;
        }

        setData(dashboardData);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your guest dashboard right now."
            : "We couldn't load your guest dashboard right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const latestTransactions = useMemo(
    () => [...(data?.payments.recentTransactions ?? [])].slice(0, 5),
    [data],
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <GuestShell
      badge="Guest Portal"
      topbarAction={
        <Link
          href="/guest/bookings"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          View bookings
        </Link>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="surface-card rounded-panel border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] p-5">
            <p className="text-[14px] leading-6 text-[var(--color-danger,#b42318)]">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Retry
            </button>
          </div>
        ) : null}

        {data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Bookings"
                value={data.bookings.total}
                helper="Total booking requests and stays across your guest account."
              />
              <MetricCard
                label="Upcoming"
                value={data.bookings.upcomingCount}
                helper="Upcoming accepted stays that are currently closest to check-in."
              />
              <MetricCard
                label="Unread"
                value={data.messages.unreadMessages}
                helper="Unread host messages waiting for your response."
              />
              <MetricCard
                label="Wishlist"
                value={data.wishlist.total}
                helper="Saved properties kept for later decision-making."
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <section className="surface-card rounded-panel p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Upcoming stays
                    </p>
                    <h2 className="mt-2 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                      Keep your next booking in view
                    </h2>
                  </div>
                  <Link
                    href="/guest/bookings"
                    className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3.5 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Open bookings
                  </Link>
                </div>

                <div className="mt-5 grid gap-4">
                  {data.bookings.upcoming.length ? (
                    data.bookings.upcoming.map((booking) => {
                      const property = propertyLookup[booking.propertyId];
                      const totalGuests = booking.adultGuests + booking.childGuests;

                      return (
                        <Link
                          key={booking.id}
                          href={`/guest/bookings/${booking.id}`}
                          className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-[17px] font-semibold text-text-primary">
                                {property?.propertyTitle || `Property ${booking.propertyId.slice(-6).toUpperCase()}`}
                              </p>
                              <p className="mt-1 text-[13px] text-text-secondary">
                                {property?.unitNamesById[booking.unitId] || "Selected unit"} ·{" "}
                                {property?.locationLabel || booking.propertyId}
                              </p>
                            </div>
                            <GuestBookingStatusPill status={booking.status} />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2.5">
                            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary">
                              {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                            </span>
                            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary">
                              {totalGuests} guest{totalGuests === 1 ? "" : "s"}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-border bg-card px-5 py-8 text-center">
                      <p className="text-[15px] font-semibold text-text-primary">
                        No upcoming stays yet
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                        Start exploring published properties and send your first booking request.
                      </p>
                      <Link
                        href="/search"
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                      >
                        Browse stays
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <section className="surface-card rounded-panel p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Recent payments
                </p>
                <h2 className="mt-2 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                  Your latest settled activity
                </h2>

                <div className="mt-5 space-y-3">
                  {latestTransactions.length ? (
                    latestTransactions.map((transaction) => {
                      const property = propertyLookup[transaction.propertyId];

                      return (
                        <div
                          key={transaction.id}
                          className="rounded-[20px] border border-border-light bg-card px-4 py-4 shadow-soft"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-[14px] font-semibold text-text-primary">
                                {property?.propertyTitle || `Reservation ${transaction.reservationId.slice(-6).toUpperCase()}`}
                              </p>
                              <p className="mt-1 text-[12px] text-text-secondary">
                                {transaction.status} ·{" "}
                                {transaction.processedAt
                                  ? formatDate(transaction.processedAt)
                                  : transaction.createdAt
                                    ? formatDate(transaction.createdAt)
                                    : "Recently"}
                              </p>
                            </div>
                            <span className="text-[14px] font-semibold text-text-primary">
                              {formatCurrency(transaction.grossAmount ?? 0, transaction.currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-border bg-card px-5 py-8 text-center">
                      <p className="text-[15px] font-semibold text-text-primary">
                        No payment records yet
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                        Payments will appear here after accepted stays move into the payment step.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </GuestShell>
  );
};
