"use client";

import React from "react";
import {
  formatHostDateTime,
  getMessageSenderLabel,
} from "@/components/host/operations/hostOperations";
import { type HostMessageThreadDetail } from "@/lib/host";

type HostConversationPanelProps = {
  thread: HostMessageThreadDetail;
  draft: string;
  isSending: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export const HostConversationPanel: React.FC<HostConversationPanelProps> = ({
  thread,
  draft,
  isSending,
  onDraftChange,
  onSend,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Conversation
          </p>
          <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            {thread.guestName || "Guest thread"}
          </h2>
        </div>
        <span className="rounded-full border border-border-light bg-white px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
          {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 max-h-[520px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
        {thread.messages.length > 0 ? (
          thread.messages.map((message) => {
            const isHostMessage = message.senderRole.trim().toLowerCase() === "host";

            return (
              <div
                key={message.id}
                className={`flex ${isHostMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[720px] rounded-[24px] px-4 py-4 ${
                    isHostMessage
                      ? "bg-primary text-text-primary shadow-glow"
                      : "border border-border-light bg-white text-text-primary shadow-soft"
                  }`}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] opacity-80">
                    {getMessageSenderLabel(message.senderRole)}
                  </p>
                  <p className="mt-2 text-[14px] leading-7">{message.body || "Empty message"}</p>
                  <p className="mt-3 text-[12px] opacity-75">{formatHostDateTime(message.createdAt)}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-border-light bg-white/80 px-5 py-6 text-[14px] leading-7 text-text-secondary">
            No messages are visible in this thread yet.
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[24px] border border-border-light bg-white/80 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Reply
        </p>
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={5}
          placeholder="Write a clear operational reply for the guest"
          className="mt-4 w-full rounded-[22px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-secondary focus:border-text-primary/25"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={isSending || !draft.trim()}
          className="mt-4 inline-flex items-center justify-center rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send message"}
        </button>
      </div>
    </div>
  );
};
