"use client";

import Link from "next/link";
import React from "react";
import {
  formatHostDateTime,
} from "@/components/host/operations/hostOperations";
import { type HostMessageThreadSummary } from "@/lib/host";

type HostMessagesListProps = {
  threads: HostMessageThreadSummary[];
  reservationId?: string;
};

export const HostMessagesList: React.FC<HostMessagesListProps> = ({ threads, reservationId = "" }) => {
  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={
            reservationId
              ? `/host/messages/${thread.id}?reservationId=${reservationId}`
              : `/host/messages/${thread.id}`
          }
          className="group block rounded-[24px] border border-border-light bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/15 hover:shadow-medium"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[16px] font-semibold text-text-primary">
                  {thread.guestName || "Guest conversation"}
                </p>
                {thread.hostUnreadCount > 0 ? (
                  <span className="rounded-full bg-primary-light px-3 py-1.5 text-[12px] font-semibold text-text-primary">
                    {thread.hostUnreadCount} unread
                  </span>
                ) : (
                  <span className="rounded-full border border-border-light bg-white px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
                    Read
                  </span>
                )}
              </div>
              <p className="mt-2 text-[14px] text-text-secondary">
                {thread.propertyName || "Property pending"} · {thread.unitName || "Unit pending"}
              </p>
              <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-text-primary">
                {thread.lastMessagePreview || "Open this thread to review the full conversation."}
              </p>
            </div>

            <div className="grid gap-2 lg:min-w-[200px] lg:text-right">
              <span className="text-[12px] uppercase tracking-[0.16em] text-text-secondary">Last activity</span>
              <span className="text-[14px] font-semibold text-text-primary">
                {formatHostDateTime(thread.lastMessageAt)}
              </span>
              <span className="text-[13px] text-text-secondary">
                Reservation #{thread.reservationId.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
