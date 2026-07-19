"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { HostMessagesList } from "@/components/host/operations/messages/HostMessagesList";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostMessageThreads,
  type HostMessageThreadSummary,
} from "@/lib/host";

const MessagesSkeleton = () => (
  <HostShell badge="Operations">
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card rounded-panel h-36 animate-pulse bg-white/75" />
        ))}
      </div>
      <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
    </div>
  </HostShell>
);

const MetricCard: React.FC<{ label: string; value: number; helper: string }> = ({
  label,
  value,
  helper,
}) => (
  <div className="surface-card rounded-panel p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-4 font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">{value}</p>
    <p className="mt-2 text-[14px] leading-6 text-text-secondary">{helper}</p>
  </div>
);

export const HostMessagesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [threads, setThreads] = useState<HostMessageThreadSummary[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const reservationId = searchParams.get("reservationId")?.trim() || "";

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadThreads = async () => {
      setIsLoading(true);
      setError("");

      try {
        const results = await getHostMessageThreads(token, {
          hasUnread: unreadOnly || undefined,
          reservationId: reservationId || undefined,
        });

        if (!isActive) {
          return;
        }

        setThreads(results);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your host inbox right now."
            : "We couldn't load your host inbox right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadThreads();

    return () => {
      isActive = false;
    };
  }, [reservationId, retryKey, token, unreadOnly]);

  const metrics = useMemo(
    () => ({
      total: threads.length,
      unreadThreads: threads.filter((thread) => thread.hostUnreadCount > 0).length,
      unreadMessages: threads.reduce((sum, thread) => sum + thread.hostUnreadCount, 0),
    }),
    [threads],
  );

  if (isLoading) {
    return <MessagesSkeleton />;
  }

  return (
    <HostShell
      badge="Operations"
      title="Messages"
      subtitle="Browse guest conversations, focus unread threads, and move into a single reservation thread when details matter."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Unread threads
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{metrics.unreadThreads}</p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Unread messages
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">{metrics.unreadMessages}</p>
          </div>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Active threads"
          value={metrics.total}
          helper="Reservation conversations currently available to your host inbox."
        />
        <MetricCard
          label="Unread threads"
          value={metrics.unreadThreads}
          helper="Threads that still contain guest messages you have not marked as read."
        />
        <MetricCard
          label="Unread messages"
          value={metrics.unreadMessages}
          helper="Total guest messages still waiting for your review."
        />
      </div>

      <div className="mt-8 surface-card rounded-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Inbox workspace
            </p>
            <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Guest communication
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">
              Open any thread to continue the conversation with context from the related reservation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                !unreadOnly
                  ? "bg-primary text-text-primary shadow-glow"
                  : "border border-border-light bg-white text-text-secondary hover:border-text-primary/15 hover:text-text-primary"
              }`}
            >
              All threads
            </button>
            <button
              type="button"
              onClick={() => setUnreadOnly(true)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                unreadOnly
                  ? "bg-primary text-text-primary shadow-glow"
                  : "border border-border-light bg-white text-text-secondary hover:border-text-primary/15 hover:text-text-primary"
              }`}
            >
              Unread only
            </button>
          </div>
        </div>

        {reservationId ? (
          <div className="mt-6 rounded-[20px] border border-border-light bg-white/80 px-4 py-4 text-[14px] leading-7 text-text-secondary">
            This inbox view is narrowed to reservation #{reservationId.slice(-6).toUpperCase()}.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-border bg-[rgba(184,82,82,0.05)] px-5 py-6">
            <p className="text-[15px] font-semibold text-text-primary">Messages unavailable</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-text-secondary">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Reload inbox
            </button>
          </div>
        ) : threads.length > 0 ? (
          <div className="mt-6">
            <HostMessagesList threads={threads} />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-border-light bg-white/80 px-5 py-6">
            <p className="text-[15px] font-semibold text-text-primary">No guest conversations yet</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-7 text-text-secondary">
              Message threads will appear here once guests start reaching out around their reservations.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/host/reservations"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Open reservations
              </Link>
              <Link
                href="/host/dashboard"
                className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </HostShell>
  );
};
