"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getGuestMessageThreads,
  getGuestPropertyLookups,
  type GuestMessageThreadSummary,
} from "@/lib/guest";

const formatDateTime = (value: string | null) => {
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

export const GuestMessagesPage: React.FC = () => {
  const { token } = useAuth();
  const [threads, setThreads] = useState<GuestMessageThreadSummary[]>([]);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadThreads = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getGuestMessageThreads(token);
        const propertyIds = Array.from(new Set(result.map((item) => item.propertyId).filter(Boolean)));
        const lookups = await getGuestPropertyLookups(propertyIds);

        if (!isActive) {
          return;
        }

        setThreads(result);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your conversations right now."
            : "We couldn't load your conversations right now.",
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
  }, [retryKey, token]);

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return threads.filter((thread) => {
      if (filter === "unread" && thread.guestUnreadCount <= 0) {
        return false;
      }

      if (!query) {
        return true;
      }

      const property = propertyLookup[thread.propertyId];
      return [
        property?.propertyTitle ?? "",
        property?.locationLabel ?? "",
        property?.unitNamesById[thread.unitId] ?? "",
        thread.lastMessagePreview,
        thread.reservationId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [filter, propertyLookup, searchQuery, threads]);

  return (
    <GuestShell
      badge="Messages"
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
              Messaging workspace
            </p>
            <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Stay in touch with your hosts
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Open reservation conversations, review unread updates, and respond from the booking context.
            </p>
          </div>

          <div className="mt-5 border-t border-border-light pt-5">
            <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search property or message"
                className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/15 focus:shadow-medium"
              />

              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All threads" },
                  { value: "unread", label: "Unread" },
                ].map((item) => {
                  const isActive = filter === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value as "all" | "unread")}
                      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-text-primary shadow-glow"
                          : "border border-border bg-card text-text-secondary shadow-soft hover:border-text-primary/15 hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
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
        ) : isLoading ? (
          <div className="space-y-3 border-t border-border-light px-5 py-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[22px] bg-white/75" />
            ))}
          </div>
        ) : filteredThreads.length ? (
          <div className="space-y-3 border-t border-border-light px-5 py-5">
            {filteredThreads.map((thread) => {
              const property = propertyLookup[thread.propertyId];

              return (
                <Link
                  key={thread.id}
                  href={`/guest/messages/${thread.id}`}
                  className="block rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/12 hover:shadow-medium"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-text-primary">
                          {property?.propertyTitle || `Reservation ${thread.reservationId.slice(-6).toUpperCase()}`}
                        </p>
                        {thread.guestUnreadCount > 0 ? (
                          <span className="rounded-full border border-primary/25 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-text-primary">
                            {thread.guestUnreadCount} unread
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[13px] text-text-secondary">
                        {property?.unitNamesById[thread.unitId] || "Selected unit"} ·{" "}
                        {property?.locationLabel || thread.propertyId}
                      </p>
                    </div>
                    <span className="text-[12px] text-text-secondary">
                      {formatDateTime(thread.lastMessageAt)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-text-secondary">
                    {thread.lastMessagePreview || "Open the thread to review the latest host update."}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="border-t border-border-light px-5 py-10 text-center">
            <p className="text-[15px] font-semibold text-text-primary">No conversations yet</p>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Reservation-linked host messages will show up here once a conversation starts.
            </p>
          </div>
        )}
      </div>
    </GuestShell>
  );
};
