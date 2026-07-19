"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HostShell } from "@/components/host/HostShell";
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

const CompactMetricCard: React.FC<{
  label: string;
  value: string | number;
  helper: string;
}> = ({ label, value, helper }) => (
  <div className="surface-card rounded-[24px] p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-2.5 font-sora text-[24px] font-bold tracking-[-0.05em] text-text-primary">
      {value}
    </p>
    <p className="mt-1.5 text-[13px] leading-5 text-text-secondary">{helper}</p>
  </div>
);

const SurfacePanel: React.FC<{
  badge: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ badge, title, description, action, children }) => (
  <div className="surface-card rounded-panel p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          {badge}
        </p>
        <h2 className="mt-2.5 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-[13px] leading-6 text-text-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="mt-5">{children}</div>
  </div>
);

const ReservationItem: React.FC<{ reservation: HostReservationPreview }> = ({ reservation }) => {
  const totalGuests = reservation.adultGuests + reservation.childGuests;

  return (
    <div className="rounded-[20px] border border-border-light bg-card px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div>
          <p className="text-[14px] font-semibold text-text-primary">
            Reservation #{reservation.id.slice(-6).toUpperCase()}
          </p>
          <p className="mt-1 text-[12px] text-text-secondary">
            {formatDate(reservation.checkInDate)} to {formatDate(reservation.checkOutDate)}
          </p>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-semibold text-text-primary">
          {totalGuests} guest{totalGuests === 1 ? "" : "s"}
        </span>
      </div>

      <Link
        href={`/host/reservations/${reservation.id}`}
        className="mt-3 inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-3.5 py-2 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
      >
        Open reservation
      </Link>
    </div>
  );
};

type PriorityAction = {
  key: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  tone?: "default" | "warning";
};

const PriorityActionCard: React.FC<{ action: PriorityAction }> = ({ action }) => (
  <div
    className={`rounded-[20px] border px-4 py-4 ${
      action.tone === "warning"
        ? "border-primary/40 bg-primary-light/55"
        : "border-border-light bg-card"
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
      {action.badge}
    </p>
    <h3 className="mt-2 text-[15px] font-semibold text-text-primary">{action.title}</h3>
    <p className="mt-2 text-[13px] leading-6 text-text-secondary">{action.description}</p>
    <Link
      href={action.href}
      className="mt-4 inline-flex items-center justify-center rounded-[14px] bg-primary px-3.5 py-2.5 text-[12px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
    >
      {action.ctaLabel}
    </Link>
  </div>
);

const QuickLinkCard: React.FC<{ title: string; href: string; helper: string }> = ({
  title,
  href,
  helper,
}) => (
  <Link
    href={href}
    className="rounded-[18px] border border-border-light bg-card px-4 py-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/15 hover:shadow-medium"
  >
    <p className="text-[14px] font-semibold text-text-primary">{title}</p>
    <p className="mt-1.5 text-[12px] leading-5 text-text-secondary">{helper}</p>
  </Link>
);

const QueueRow: React.FC<{
  title: string;
  helper: string;
  value: string;
  href: string;
}> = ({ title, helper, value, href }) => (
  <Link
    href={href}
    className="flex items-center justify-between gap-3 rounded-[18px] border border-border-light bg-card px-4 py-3 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/15 hover:shadow-medium"
  >
    <div className="min-w-0">
      <p className="text-[14px] font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-[12px] leading-5 text-text-secondary">{helper}</p>
    </div>
    <span className="rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-semibold text-text-primary">
      {value}
    </span>
  </Link>
);

const DashboardSkeleton = () => (
  <HostShell
    badge="Today"
    title="Host dashboard"
    subtitle="We are preparing your most important host actions, metrics, and queues."
  >
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card rounded-panel h-56 animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-56 animate-pulse bg-white/75" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="surface-card rounded-panel h-28 animate-pulse bg-white/75"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-72 animate-pulse bg-white/75" />
      </div>
    </div>
  </HostShell>
);

const DashboardErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <HostShell
    badge="Today"
    title="Dashboard unavailable"
    subtitle="The compact host workspace is ready, but today's summary could not be loaded yet."
  >
    <div className="surface-card rounded-panel p-5 md:p-6">
      <p className="text-[15px] font-semibold text-text-primary">We couldn't load today's host summary</p>
      <p className="mt-2.5 max-w-2xl text-[14px] leading-6 text-text-secondary">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
        >
          Reload dashboard
        </button>
        <Link
          href="/host/properties"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Open properties
        </Link>
      </div>
    </div>
  </HostShell>
);

export const HostDashboardShell: React.FC = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [payoutProfile, setPayoutProfile] = useState<HostPayoutProfile | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token || !user) {
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

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your host dashboard right now. Please try again."
            : "We couldn't load your host dashboard right now. Please try again.",
        );
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
  }, [retryKey, token, user]);

  if (!user || !token || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data || error) {
    return (
      <DashboardErrorState
        message={error || "We couldn't load your host dashboard right now. Please try again."}
        onRetry={() => setRetryKey((current) => current + 1)}
      />
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
  const priorityActions = [
    !profileSetupStatus.isComplete
      ? {
          key: "profile",
        badge: "Setup",
        title: "Finish your host profile",
        description: `Add ${formatMissingFields(profileSetupStatus.missingFields)} so guests and listings show a complete host identity.`,
          href: "/host/profile",
        ctaLabel: "Open profile",
        }
      : null,
    !payoutSetupStatus.isComplete
      ? {
          key: "payouts",
        badge: "Setup",
        title: "Complete payout setup",
        description: `Add ${formatMissingFields(payoutSetupStatus.missingFields)} so pending balances can move through payout release cleanly.`,
          href: "/host/payouts",
          ctaLabel: "Open payouts",
        }
      : null,
    data.properties.rejected > 0
      ? {
        key: "rejected",
        badge: "Listings",
        title: "Fix rejected listings",
        description: `${data.properties.rejected} listing${data.properties.rejected === 1 ? "" : "s"} need updates before returning to review.`,
        href: "/host/verification",
        ctaLabel: "Review status",
        tone: "warning" as const,
      }
      : null,
    data.properties.draft > 0
      ? {
        key: "drafts",
        badge: "Listings",
        title: "Continue property drafts",
        description: `${data.properties.draft} draft listing${data.properties.draft === 1 ? "" : "s"} can move forward from basics into submission.`,
        href: "/host/properties",
        ctaLabel: "Open properties",
      }
      : null,
    data.messages.unreadThreads > 0
      ? {
        key: "messages",
        badge: "Inbox",
        title: "Reply to unread threads",
        description: `${data.messages.unreadThreads} conversation${data.messages.unreadThreads === 1 ? "" : "s"} still need your attention.`,
        href: "/host/messages",
        ctaLabel: "Open inbox",
      }
      : null,
    data.reservations.upcomingCount > 0
      ? {
        key: "reservations",
        badge: "Reservations",
        title: "Review upcoming arrivals",
        description: `${data.reservations.upcomingCount} reservation${data.reservations.upcomingCount === 1 ? "" : "s"} are approaching and ready for final checks.`,
        href: "/host/reservations",
        ctaLabel: "Open reservations",
      }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const topActions = priorityActions.slice(0, 4);
  const financeSummary = [
    {
      label: "Net earnings",
      value: formatCurrency(data.earnings.netEarnings, currency),
    },
    {
      label: "Pending payout",
      value: formatCurrency(data.payouts.pendingPayout, currency),
    },
    {
      label: "Paid out",
      value: formatCurrency(data.payouts.paidOut, currency),
    },
  ];

  return (
    <HostShell
      badge="Today"
      title={`Welcome back, ${user.firstName}`}
      subtitle="Track what needs attention today, then jump straight into the right host workspace."
      headerAside={
        <>
          <div className="rounded-[20px] border border-border-light bg-card px-4 py-3 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Needs action
            </p>
            <p className="mt-2 text-[15px] font-semibold text-text-primary">
              {data.properties.draft + data.properties.rejected + data.messages.unreadThreads}
            </p>
          </div>
          <div className="rounded-[20px] border border-border-light bg-card px-4 py-3 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Pending payout
            </p>
            <p className="mt-2 text-[15px] font-semibold text-text-primary">
              {formatCurrency(data.payouts.pendingPayout, currency)}
            </p>
          </div>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SurfacePanel
          badge="Priority actions"
          title="Handle what matters today"
          description="Keep this page focused on the next few actions instead of full workspace previews."
          action={
            <Link
              href="/host/properties/new"
              className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Add property
            </Link>
          }
        >
          {topActions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {topActions.map((action) => (
                <PriorityActionCard key={action.key} action={action} />
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] border border-border-light bg-card px-4 py-4">
              <p className="text-[14px] font-semibold text-text-primary">Nothing urgent right now.</p>
              <p className="mt-2 text-[13px] leading-6 text-text-secondary">
                Your setup looks healthy and there are no draft, rejected, or unread items demanding immediate attention.
              </p>
            </div>
          )}
        </SurfacePanel>

        <SurfacePanel
          badge="Quick links"
          title="Open a workspace"
          description="Jump into the right host area without scrolling through previews."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <QuickLinkCard
              title="Properties"
              href="/host/properties"
              helper="Continue drafts, review statuses, and add new listings."
            />
            <QuickLinkCard
              title="Reservations"
              href="/host/reservations"
              helper="Track arrivals, guest stays, and reservation decisions."
            />
            <QuickLinkCard
              title="Messages"
              href="/host/messages"
              helper="Reply to guest conversations and unread threads."
            />
            <QuickLinkCard
              title="Verification status"
              href="/host/verification"
              helper="Check approvals, rejections, and review progress."
            />
          </div>
        </SurfacePanel>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <CompactMetricCard
          label="Active properties"
          value={data.properties.approved}
          helper={`${data.properties.total} total listings`}
        />
        <CompactMetricCard
          label="Submitted"
          value={data.properties.submitted}
          helper="Currently under review"
        />
        <CompactMetricCard
          label="Unread threads"
          value={data.messages.unreadThreads}
          helper={`${data.messages.unreadMessages} unread messages`}
        />
        <CompactMetricCard
          label="Upcoming stays"
          value={data.reservations.upcomingCount}
          helper="Next check-ins on deck"
        />
        <CompactMetricCard
          label="Pending payout"
          value={formatCurrency(data.payouts.pendingPayout, currency)}
          helper="Ready for payout review"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SurfacePanel
            badge="Attention queues"
            title="Start with the shortest path"
            description="Open the next workspace directly from the queue that needs attention."
          >
            <div className="space-y-3">
              <QueueRow
                title="Property pipeline"
                helper={`${data.properties.draft} drafts and ${data.properties.rejected} rejected listings still need work.`}
                value={`${data.properties.draft + data.properties.rejected}`}
                href="/host/properties"
              />
              <QueueRow
                title="Review queue"
                helper={`${data.properties.submitted} submitted listing${data.properties.submitted === 1 ? "" : "s"} are waiting on approval.`}
                value={`${data.properties.submitted}`}
                href="/host/verification"
              />
              <QueueRow
                title="Unread inbox"
                helper={`${data.messages.unreadThreads} thread${data.messages.unreadThreads === 1 ? "" : "s"} are waiting for your reply.`}
                value={`${data.messages.unreadThreads}`}
                href="/host/messages"
              />
              <QueueRow
                title="Upcoming arrivals"
                helper={`${data.reservations.upcomingCount} reservation${data.reservations.upcomingCount === 1 ? "" : "s"} are approaching check-in.`}
                value={`${data.reservations.upcomingCount}`}
                href="/host/reservations"
              />
            </div>
          </SurfacePanel>

          <SurfacePanel
            badge="Upcoming stays"
            title="Next arrivals"
            description="Keep this section short and operational so you can review arrivals without opening the full reservations workspace first."
            action={
              <Link
                href="/host/reservations"
                className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open reservations
              </Link>
            }
          >
            {data.reservations.upcoming.length > 0 ? (
              <div className="space-y-3">
                {data.reservations.upcoming.slice(0, 3).map((reservation) => (
                  <ReservationItem key={reservation.id} reservation={reservation} />
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-border bg-card px-4 py-4 text-[13px] leading-6 text-text-secondary">
                No upcoming reservations right now.
              </div>
            )}
          </SurfacePanel>
        </div>

        <div className="space-y-6">
          <SurfacePanel
            badge="Finance snapshot"
            title="Keep finance compact"
            description="Use the full earnings and payouts pages for deep review. This page keeps only the most useful headline numbers."
            action={
              <Link
                href="/host/earnings"
                className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open earnings
              </Link>
            }
          >
            <div className="space-y-3">
              {financeSummary.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-[18px] border border-border-light bg-card px-4 py-3"
                >
                  <span className="text-[13px] text-text-secondary">{row.label}</span>
                  <span className="text-[13px] font-semibold text-text-primary">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/host/payouts"
                className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open payouts
              </Link>
              <Link
                href="/host/reviews"
                className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open reviews
              </Link>
            </div>
          </SurfacePanel>

          <SurfacePanel
            badge="Workspace links"
            title="Go straight to the next area"
            description="Use these quick links when you already know which host workspace needs your attention."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <QuickLinkCard
                title="Host profile"
                href="/host/profile"
                helper="Update host identity, contact details, and bio."
              />
              <QuickLinkCard
                title="Payout setup"
                href="/host/payouts"
                helper="Complete payout details and keep your release profile ready."
              />
              <QuickLinkCard
                title="Businesses"
                href="/host/businesses"
                helper="Manage reusable business profiles for commercial listings."
              />
              <QuickLinkCard
                title="Reviews"
                href="/host/reviews"
                helper="Track feedback and guest review opportunities."
              />
            </div>
          </SurfacePanel>
        </div>
      </div>
    </HostShell>
  );
};
