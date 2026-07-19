"use client";

import React from "react";
import { type HostBusinessDocument } from "@/lib/host";

type HostPropertyBusinessDocumentsSelectorProps = {
  ownershipType: string;
  documents: HostBusinessDocument[];
  selectedDocumentIds: string[];
  disabled: boolean;
  error?: string;
  onToggle: (documentId: string) => void;
};

export const HostPropertyBusinessDocumentsSelector: React.FC<
  HostPropertyBusinessDocumentsSelectorProps
> = ({ ownershipType, documents, selectedDocumentIds, disabled, error, onToggle }) => {
  if (ownershipType.trim().toLowerCase() !== "commercial") {
    return null;
  }

  return (
    <div className="rounded-[22px] border border-border-light bg-white/85 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        Reusable business proof
      </p>
      <h3 className="mt-3 text-[18px] font-semibold text-text-primary">
        Choose reusable business documents
      </h3>
      <p className="mt-3 text-[14px] leading-6 text-text-secondary">
        These are business-level documents. Keep them separate from property verification, which
        still belongs to the property-specific verification stage later in the workflow.
      </p>

      {documents.length === 0 ? (
        <div className="mt-4 rounded-[18px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
          No reusable business documents are available for the selected business yet.
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {documents.map((document) => {
            const checked = selectedDocumentIds.includes(document.id);

            return (
              <label
                key={document.id}
                className={`flex cursor-pointer items-start gap-3 rounded-[18px] border px-4 py-3 text-[14px] leading-6 transition-all ${
                  checked
                    ? "border-primary/35 bg-primary-light/80 text-text-primary"
                    : "border-border-light bg-white text-text-primary"
                } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(document.id)}
                  className="mt-1 h-4 w-4 rounded border-border-light text-primary"
                />
                <span>
                  <span className="block font-semibold">
                    {document.title || document.fileName || "Business document"}
                  </span>
                  <span className="mt-1 block text-[13px] text-text-secondary">
                    {document.documentType || "No document type set"}
                  </span>
                  {document.note ? (
                    <span className="mt-1 block text-[13px] text-text-secondary">{document.note}</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {error ? <p className="mt-3 text-[13px] text-red-600">{error}</p> : null}
    </div>
  );
};
