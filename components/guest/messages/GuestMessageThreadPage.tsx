"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getGuestMessageThread,
  getGuestPropertyLookups,
  markGuestMessageThreadRead,
  sendGuestMessage,
  type GuestMessageThreadDetail,
} from "@/lib/guest";

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const GuestMessageThreadPage: React.FC<{ threadId: string }> = ({ threadId }) => {
  const { token } = useAuth();
  const [thread, setThread] = useState<GuestMessageThreadDetail | null>(null);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadThread = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getGuestMessageThread(token, threadId);
        const lookups = await getGuestPropertyLookups([result.propertyId]);

        if (!isActive) {
          return;
        }

        setThread(result);
        setPropertyLookup(lookups);

        if (result.guestUnreadCount > 0) {
          try {
            const readResult = await markGuestMessageThreadRead(token, threadId);

            if (!isActive) {
              return;
            }

            setThread((current) =>
              current
                ? {
                    ...current,
                    guestUnreadCount: readResult.guestUnreadCount,
                    hostUnreadCount: readResult.hostUnreadCount,
                  }
                : current,
            );
          } catch {
            // Ignore background read-state failure and keep thread usable.
          }
        }
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this conversation right now."
            : "We couldn't load this conversation right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadThread();

    return () => {
      isActive = false;
    };
  }, [retryKey, threadId, token]);

  const property = thread ? propertyLookup[thread.propertyId] : null;
  const hostUserIds = useMemo(
    () =>
      Array.from(
        new Set(
          (thread?.messages ?? [])
            .filter((message) => message.senderRole.trim().toLowerCase() === "host")
            .map((message) => message.senderId)
            .filter(Boolean),
        ),
      ),
    [thread],
  );

  return (
    <GuestShell
      badge="Messages"
      topbarAction={
        <Link
          href="/guest/messages"
          className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to messages
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

        {isLoading ? (
          <div className="surface-card rounded-panel p-5">
            <div className="space-y-4">
              <div className="h-20 animate-pulse rounded-[22px] bg-white/75" />
              <div className="h-[360px] animate-pulse rounded-[22px] bg-white/70" />
            </div>
          </div>
        ) : thread ? (
          <>
            <section className="surface-card rounded-panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Conversation detail
                  </p>
                  <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.05em] text-text-primary">
                    {property?.propertyTitle || `Reservation ${thread.reservationId.slice(-6).toUpperCase()}`}
                  </h1>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                    {property?.unitNamesById[thread.unitId] || "Selected unit"} ·{" "}
                    {property?.locationLabel || thread.propertyId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/guest/bookings/${thread.reservationId}`}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Open booking
                  </Link>
                  {hostUserIds[0] ? (
                    <Link
                      href={`/guest/safety?threadId=${thread.id}&userId=${hostUserIds[0]}&reservationId=${thread.reservationId}`}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      Safety actions
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="surface-card rounded-panel p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Messages
                </p>

                <div className="mt-5 space-y-3">
                  {thread.messages.length ? (
                    thread.messages.map((message) => {
                      const isGuest = message.senderRole.trim().toLowerCase() === "guest";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isGuest ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[22px] px-4 py-3 shadow-soft ${
                              isGuest
                                ? "bg-primary text-text-primary"
                                : "border border-border-light bg-card text-text-primary"
                            }`}
                          >
                            <p className="text-[14px] leading-6">{message.body}</p>
                            <p
                              className={`mt-2 text-[11px] ${
                                isGuest ? "text-text-primary/80" : "text-text-secondary"
                              }`}
                            >
                              {isGuest ? "You" : "Host"} · {formatDateTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-border bg-card px-4 py-5 text-[14px] text-text-secondary">
                      No messages yet for this reservation thread.
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-border-light pt-5">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Reply
                    </span>
                    <textarea
                      rows={4}
                      value={draftMessage}
                      onChange={(event) => {
                        setDraftMessage(event.target.value);
                        setSendError("");
                      }}
                      placeholder="Hi, we expect to arrive around 8 PM."
                      className="mt-2 w-full rounded-[22px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/15 focus:shadow-medium"
                    />
                  </label>

                  {sendError ? (
                    <p className="mt-3 text-[13px] text-[var(--color-danger,#b42318)]">{sendError}</p>
                  ) : null}

                  <button
                    type="button"
                    disabled={isSending}
                    onClick={async () => {
                      if (!token) {
                        return;
                      }

                      if (!draftMessage.trim()) {
                        setSendError("Message body is required.");
                        return;
                      }

                      setIsSending(true);
                      setSendError("");

                      try {
                        await sendGuestMessage(token, thread.id, draftMessage);
                        const refreshedThread = await getGuestMessageThread(token, thread.id);
                        setThread(refreshedThread);
                        setDraftMessage("");
                      } catch (requestError) {
                        setSendError(
                          requestError instanceof ApiError
                            ? requestError.message || "Unable to send your message right now."
                            : "Unable to send your message right now.",
                        );
                      } finally {
                        setIsSending(false);
                      }
                    }}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSending ? "Sending..." : "Send message"}
                  </button>
                </div>
              </section>

              <section className="surface-card rounded-panel p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Thread details
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[18px] border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Reservation
                    </p>
                    <p className="mt-2 text-[14px] font-semibold text-text-primary">
                      {thread.reservationId}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Last message
                    </p>
                    <p className="mt-2 text-[14px] text-text-primary">
                      {formatDateTime(thread.lastMessageAt)}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Host user refs
                    </p>
                    <p className="mt-2 break-all text-[14px] text-text-primary">
                      {hostUserIds.join(", ") || "Host sender id will appear after host messages exist."}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </GuestShell>
  );
};
