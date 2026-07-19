"use client";

import React from "react";
import { type HostPropertyVerificationDocument } from "@/lib/host";

type HostPropertyVerificationListProps = {
  documents: HostPropertyVerificationDocument[];
};

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatFileSize = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) {
    return "";
  }

  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(2)} MB`;
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(0)} KB`;
  }

  return `${value} B`;
};

export const HostPropertyVerificationList: React.FC<HostPropertyVerificationListProps> = ({
  documents,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Current proof
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        Review the files attached to this property
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        These are the verification documents currently available for admin review.
      </p>

      {documents.length === 0 ? (
        <div className="mt-6 rounded-[22px] border border-border-light bg-white/80 px-5 py-5">
          <p className="text-[14px] leading-7 text-text-secondary">
            No verification files are attached yet. Upload at least one supporting file before
            submission.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {documents.map((document) => {
            const savedLabel = formatTimestamp(document.updatedAt || document.createdAt);

            return (
              <div
                key={document.id || `${document.fileName}-${document.fileUrl}`}
                className="rounded-[22px] border border-border-light bg-white/85 px-5 py-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-text-primary">
                      {document.originalFileName || document.fileName || "Verification document"}
                    </p>
                    {document.documentType ? (
                      <p className="mt-1 text-[13px] leading-6 text-text-secondary">
                        Type: {document.documentType}
                      </p>
                    ) : null}
                    {document.mimeType || document.fileSize !== null ? (
                      <p className="mt-1 text-[13px] leading-6 text-text-secondary">
                        {[document.mimeType, formatFileSize(document.fileSize)].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                    {document.note ? (
                      <p className="mt-2 text-[13px] leading-6 text-text-secondary">
                        {document.note}
                      </p>
                    ) : null}
                    {savedLabel ? (
                      <p className="mt-2 text-[12px] uppercase tracking-[0.16em] text-text-secondary">
                        Saved {savedLabel}
                      </p>
                    ) : null}
                  </div>

                  {document.fileUrl ? (
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center justify-center rounded-[18px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      Open file
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
