"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { HostConversationPanel } from "@/components/host/operations/messages/HostConversationPanel";
import { formatHostDateTime } from "@/components/host/operations/hostOperations";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getHostMessageThread,
  markHostMessageThreadRead,
  sendHostMessage,
  type HostMessageThreadDetail,
} from "@/lib/host";

type HostMessageThreadPageProps = {
  threadId: string;
};

const ThreadSkeleton = () => (
  <HostShell badge="Operations">
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="surface-card rounded-panel h-[760px] animate-pulse bg-white/75" />
      <div className="surface-card rounded-panel h-[340px] animate-pulse bg-white/75" />
    </div>
  </HostShell>
);

const DetailCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">{label}</p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

export const HostMessageThreadPage: React.FC<HostMessageThreadPageProps> = ({ threadId }) => {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [thread, setThread] = useState<HostMessageThreadDetail | null>(null);
  const [draft, setDraft] = useState("");
  const [pageError, setPageError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const reservationId = searchParams.get("reservationId")?.trim() || "";
  const backToMessagesHref = reservationId ? `/host/messages?reservationId=${reservationId}` : "/host/messages";

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadThread = async () => {
      setIsLoading(true);
      setPageError("");
      setSendError("");
      setSendSuccess("");

      try {
        const result = await getHostMessageThread(token, threadId);
        const normalizedResult =
          result.hostUnreadCount > 0 ? await markHostMessageThreadRead(token, threadId) : result;

        if (!isActive) {
          return;
        }

        setThread(normalizedResult);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setPageError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load this thread right now."
            : "We couldn't load this thread right now.",
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

  const handleSend = async () => {
    if (!token || !thread || !draft.trim()) {
      return;
    }

    setIsSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      const nextThread = await sendHostMessage(token, thread.id, { body: draft });
      setThread(nextThread);
      setDraft("");
      setSendSuccess("Message sent successfully.");
    } catch (requestError) {
      setSendError(
        requestError instanceof ApiError
          ? requestError.message || "We couldn't send this message right now."
          : "We couldn't send this message right now.",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <ThreadSkeleton />;
  }

  if (!thread || pageError) {
    return (
      <HostShell
        badge="Operations"
        title="Message thread"
        subtitle="Read one guest conversation and continue the exchange when needed."
      >
        <div className="surface-card rounded-panel px-6 py-8">
          <p className="text-[15px] font-semibold text-text-primary">Thread unavailable</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-text-secondary">
            {pageError || "We couldn't load this thread right now."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
            >
              Reload thread
            </button>
            <Link
              href={backToMessagesHref}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to messages
            </Link>
          </div>
        </div>
      </HostShell>
    );
  }

  return (
    <HostShell
      badge="Operations"
      title={thread.guestName || "Message thread"}
      subtitle="Keep the guest conversation visible alongside reservation and property context."
      headerAside={
        <>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Reservation
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              #{thread.reservationId.slice(-6).toUpperCase()}
            </p>
          </div>
          <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Last activity
            </p>
            <p className="mt-3 text-[17px] font-semibold text-text-primary">
              {formatHostDateTime(thread.lastMessageAt)}
            </p>
          </div>
        </>
      }
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href={backToMessagesHref}
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Back to messages
        </Link>
        <Link
          href={`/host/reservations/${thread.reservationId}`}
          className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
        >
          Open reservation
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <HostConversationPanel
            thread={thread}
            draft={draft}
            isSending={isSending}
            onDraftChange={setDraft}
            onSend={() => void handleSend()}
          />
          {sendError ? <p className="mt-4 text-[14px] text-[rgb(140,50,50)]">{sendError}</p> : null}
          {sendSuccess ? <p className="mt-4 text-[14px] text-[rgb(35,92,69)]">{sendSuccess}</p> : null}
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Thread context
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Related stay
            </h2>

            <div className="mt-5 space-y-3">
              <DetailCard label="Guest" value={thread.guestName || "Not available"} />
              <DetailCard label="Property" value={thread.propertyName || "Not available"} />
              <DetailCard label="Unit" value={thread.unitName || "Not available"} />
              <DetailCard label="Reservation ID" value={thread.reservationId || "Not available"} />
            </div>
          </div>

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Read state
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Message visibility
            </h2>
            <div className="mt-5 space-y-3">
              <DetailCard label="Host unread" value={String(thread.hostUnreadCount)} />
              <DetailCard label="Guest unread" value={String(thread.guestUnreadCount)} />
              <DetailCard label="Last update" value={formatHostDateTime(thread.lastMessageAt)} />
            </div>
          </div>
        </div>
      </div>
    </HostShell>
  );
};
