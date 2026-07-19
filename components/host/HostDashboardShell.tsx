"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { HostSetupPromptCard } from "@/components/host/HostSetupPromptCard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostDashboard,
  getHostPayoutProfile,
  getHostPayoutSetupStatus,
  getHostProfile,
  getHostProfileSetupStatus,
  type HostDashboardData,
  type HostPayoutProfile,
  type HostProfile,
  type HostReservationPreview,
} from "@/lib/host";

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

const formatMissingFields = (fields: string[]) => {
  if (fields.length === 0) {
    return "";
  }

  if (fields.length === 1) {
    return fields[0];
  }

  if (fields.length === 2) {
    return `${fields[0]} and ${fields[1]}`;
  }

  return `${fields.slice(0, -1).join(", ")}, and ${fields[fields.length - 1]}`;
};

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
  actionHref?: string;
  actionLabel?: string;
}> = ({ title, rows, actionHref, actionLabel }) => (
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

    {actionHref && actionLabel ? (
      <Link
        href={actionHref}
        className="mt-5 inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
      >
        {actionLabel}
      </Link>
    ) : null}
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

      <Link
        href={`/host/reservations/${reservation.id}`}
        className="mt-4 inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
      >
        Open reservation
      </Link>
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
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [payoutProfile, setPayoutProfile] = useState<HostPayoutProfile | null>(null);
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

        const [profileResult, payoutResult] = await Promise.allSettled([
          getHostProfile(token),
          getHostPayoutProfile(token),
        ]);

        if (!isActive) {
          return;
        }

        setData(dashboard);
        setProfile(
          profileResult.status === "fulfilled"
            ? profileResult.value
            : {
                id: user.id,
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email ?? "",
                phone: user.phone ?? "",
                address: user.address ?? "",
                profilePhoto: user.profilePhoto ?? "",
                bio: user.bio ?? "",
              },
        );
        setPayoutProfile(payoutResult.status === "fulfilled" ? payoutResult.value : null);
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
    return null;
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
  const profileSetupStatus = getHostProfileSetupStatus(
    profile ?? {
      id: user.id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      profilePhoto: user.profilePhoto ?? "",
      bio: user.bio ?? "",
    },
  );
  const payoutSetupStatus = getHostPayoutSetupStatus(payoutProfile);
  const setupPrompts = [
    !profileSetupStatus.isComplete
      ? {
          key: "profile",
          badge: "Profile setup",
          title: "Complete your host profile",
          description: `Add ${formatMissingFields(profileSetupStatus.missingFields)} so your host identity feels complete across the portal.`,
          href: "/host/profile",
          ctaLabel: "Open profile",
        }
      : null,
    !payoutSetupStatus.isComplete
      ? {
          key: "payouts",
          badge: "Payout setup",
          title: "Finish payout readiness",
          description: `Add ${formatMissingFields(payoutSetupStatus.missingFields)} so future payout flows start from a ready profile.`,
          href: "/host/payouts",
          ctaLabel: "Open payouts",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

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
      {setupPrompts.length > 0 ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {setupPrompts.map((prompt) => (
            <HostSetupPromptCard
              key={prompt.key}
              badge={prompt.badge}
              title={prompt.title}
              description={prompt.description}
              href={prompt.href}
              ctaLabel={prompt.ctaLabel}
            />
          ))}
        </div>
      ) : null}

      <div className="surface-card mb-6 rounded-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Listing workflow
            </p>
            <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Turn your overview into active listings
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
              Properties and add-property routes are now part of the portal, so you can move straight
              from summary metrics into draft creation and listing management.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/host/properties/new"
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Add property
            </Link>
            <Link
              href="/host/properties"
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              View properties
            </Link>
          </div>
        </div>
      </div>

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

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/host/reservations"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open reservations
              </Link>
              <Link
                href="/host/messages"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open messages
              </Link>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Messages
                </p>
                <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                  Inbox snapshot
                </h2>
              </div>
              <Link
                href="/host/messages"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                View inbox
              </Link>
            </div>

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
            actionHref="/host/earnings"
            actionLabel="Open earnings"
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
            actionHref="/host/payouts"
            actionLabel="Open payouts"
          />

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Reviews
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Guest feedback workspace
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-text-secondary">
              Property reviews and guest-review history now live in the host operations layer.
            </p>
            <Link
              href="/host/reviews"
              className="mt-5 inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Open reviews
            </Link>
          </div>
        </div>
      </div>
    </HostShell>
  );
};
