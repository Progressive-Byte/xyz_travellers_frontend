"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { getHostDashboard, type HostDashboardData, type HostReservationPreview } from "@/lib/host";

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

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  helper: string;
}> = ({ label, value, helper }) => (
  <div className="surface-card rounded-panel p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-4 font-sora text-[34px] font-bold tracking-[-0.05em] text-text-primary">
      {value}
    </p>
    <p className="mt-2 text-[14px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

const MoneyCard: React.FC<{
  title: string;
  rows: Array<{ label: string; value: string }>;
}> = ({ title, rows }) => (
  <div className="surface-card rounded-panel p-6">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {title}
        </p>
        <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
          {rows[0]?.value}
        </h2>
      </div>
      <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
        Live summary
      </span>
    </div>

    <div className="mt-5 space-y-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between rounded-[22px] border border-border-light bg-card px-4 py-3"
        >
          <span className="text-[14px] text-text-secondary">{row.label}</span>
          <span className="text-[14px] font-semibold text-text-primary">{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const ReservationItem: React.FC<{ reservation: HostReservationPreview }> = ({ reservation }) => {
  const totalGuests = reservation.adultGuests + reservation.childGuests;

  return (
    <div className="rounded-[22px] border border-border-light bg-card px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-text-primary">
            Reservation #{reservation.id.slice(-6).toUpperCase()}
          </p>
          <p className="mt-1 text-[13px] text-text-secondary">
            {formatDate(reservation.checkInDate)} to {formatDate(reservation.checkOutDate)}
          </p>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-1.5 text-[12px] font-semibold text-text-primary">
          {totalGuests} guest{totalGuests === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-border-light bg-surface px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Adults</p>
          <p className="mt-2 text-[16px] font-semibold text-text-primary">
            {reservation.adultGuests}
          </p>
        </div>
        <div className="rounded-[18px] border border-border-light bg-surface px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Children</p>
          <p className="mt-2 text-[16px] font-semibold text-text-primary">
            {reservation.childGuests}
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="section-shell py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="space-y-8">
          <div className="surface-card rounded-panel h-36 animate-pulse bg-white/70" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="surface-card rounded-panel h-40 animate-pulse bg-white/70"
              />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="surface-card rounded-panel h-96 animate-pulse bg-white/70" />
            <div className="space-y-6">
              <div className="surface-card rounded-panel h-56 animate-pulse bg-white/70" />
              <div className="surface-card rounded-panel h-56 animate-pulse bg-white/70" />
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export const HostDashboardShell: React.FC = () => {
  const router = useRouter();
  const { user, token, isHydrated, isAuthenticated } = useAuth();
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const hasHostRole = useMemo(() => user?.roles?.includes("host") ?? false, [user]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !user || !token) {
      router.replace("/auth?mode=login&intent=host");
      return;
    }

    if (!hasHostRole) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const dashboard = await getHostDashboard(token);

        if (!isActive) {
          return;
        }

        setData(dashboard);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
          setError("Your account does not currently have host dashboard access.");
          return;
        }

        setError("We couldn't load your host dashboard right now. Please try again.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [hasHostRole, isAuthenticated, isHydrated, retryKey, router, token, user]);

  if (!isHydrated || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated || !user || !token) {
    return null;
  }

  if (!hasHostRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="section-shell py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="surface-card-strong rounded-panel p-8 md:p-10">
              <span className="section-badge">Host Portal</span>
              <h1 className="mt-6 font-sora text-[34px] font-bold tracking-[-0.05em] text-text-primary md:text-[44px]">
                Host access required
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-text-secondary">
                This dashboard is only available to approved hosts. Your current account is signed
                in, but it does not have host access yet.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Back to homepage
                </Link>
                <Link
                  href="/auth?mode=login&intent=host"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
                >
                  Host sign in
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="section-shell py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="surface-card-strong rounded-panel p-8 md:p-10">
              <span className="section-badge">Host Portal</span>
              <h1 className="mt-6 font-sora text-[34px] font-bold tracking-[-0.05em] text-text-primary md:text-[44px]">
                Dashboard unavailable
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-text-secondary">
                {error || "We couldn't load your host dashboard right now. Please try again."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:bg-surface"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currency = data.earnings.currency || data.payouts.currency || "BDT";

  return (
    <HostShell
      badge="Host Portal"
      title={`Welcome back, ${user.firstName}`}
      subtitle="Here's your hosting overview today, including property status, upcoming reservations, unread messages, and earnings."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Host status
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">Approved host</p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Net earnings
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              {formatCurrency(data.earnings.netEarnings, currency)}
            </p>
          </div>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total properties"
              value={data.properties.total}
              helper={`${data.properties.approved} approved and ready for stays`}
            />
            <MetricCard
              label="Approved properties"
              value={data.properties.approved}
              helper={`${data.properties.submitted} currently under review`}
            />
            <MetricCard
              label="Active units"
              value={data.units.active}
              helper={`${data.units.total} total units linked to your listings`}
            />
            <MetricCard
              label="Upcoming reservations"
              value={data.reservations.upcomingCount}
              helper="Your next arrivals are shown below"
            />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Property status
                </p>
                <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                  Listing health
                </h2>
              </div>
              <p className="text-[14px] leading-6 text-text-secondary">
                Quick overview of all property states.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Approved", value: data.properties.approved },
                { label: "Submitted", value: data.properties.submitted },
                { label: "Draft", value: data.properties.draft },
                { label: "Rejected", value: data.properties.rejected },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                    {item.label}
                  </p>
                  <p className="mt-3 text-[26px] font-semibold text-text-primary">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Reservations
                </p>
                <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                  Upcoming stays
                </h2>
              </div>
              <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
                {data.reservations.upcomingCount} upcoming
              </span>
            </div>

            {data.reservations.upcoming.length > 0 ? (
              <div className="mt-6 space-y-4">
                {data.reservations.upcoming.map((reservation) => (
                  <ReservationItem key={reservation.id} reservation={reservation} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-border bg-card px-5 py-6 text-[14px] leading-7 text-text-secondary">
                No upcoming reservations right now.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Messages
            </p>
            <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Inbox snapshot
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  Unread threads
                </p>
                <p className="mt-3 text-[28px] font-semibold text-text-primary">
                  {data.messages.unreadThreads}
                </p>
              </div>
              <div className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  Unread messages
                </p>
                <p className="mt-3 text-[28px] font-semibold text-text-primary">
                  {data.messages.unreadMessages}
                </p>
              </div>
            </div>
          </div>

          <MoneyCard
            title="Earnings"
            rows={[
              {
                label: "Net earnings",
                value: formatCurrency(data.earnings.netEarnings, currency),
              },
              {
                label: "Gross revenue",
                value: formatCurrency(data.earnings.grossRevenue, currency),
              },
              {
                label: "Commission total",
                value: formatCurrency(data.earnings.commissionTotal, currency),
              },
              {
                label: "Refund total",
                value: formatCurrency(data.earnings.refundTotal, currency),
              },
            ]}
          />

          <MoneyCard
            title="Payouts"
            rows={[
              {
                label: "Pending payout",
                value: formatCurrency(data.payouts.pendingPayout, currency),
              },
              {
                label: "Paid out",
                value: formatCurrency(data.payouts.paidOut, currency),
              },
            ]}
          />

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Next steps
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              More host tools later
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {["Reservations", "Messages", "Earnings", "Properties"].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-border-light bg-card px-4 py-4 text-[14px] font-medium text-text-primary shadow-soft"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HostShell>
  );
};
