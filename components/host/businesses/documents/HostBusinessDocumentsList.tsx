"use client";

import React, { useMemo, useState } from "react";
import {
  businessDocumentTypeOptions,
  getBusinessDocumentTypeLabel,
  type BusinessDocumentType,
} from "@/components/host/businesses/documents/businessDocumentTypes";
import {
  type HostBusinessDocument,
  type UpdateHostBusinessDocumentPayload,
} from "@/lib/host";

type HostBusinessDocumentsListProps = {
  documents: HostBusinessDocument[];
  disabled: boolean;
  savingDocumentId: string;
  deletingDocumentId: string;
  onSave: (documentId: string, payload: UpdateHostBusinessDocumentPayload) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
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

export const HostBusinessDocumentsList: React.FC<HostBusinessDocumentsListProps> = ({
  documents,
  disabled,
  savingDocumentId,
  deletingDocumentId,
  onSave,
  onDelete,
}) => {
  const [editingDocumentId, setEditingDocumentId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, UpdateHostBusinessDocumentPayload>>({});
  const [formError, setFormError] = useState("");

  const editableDrafts = useMemo(() => drafts, [drafts]);

  const startEditing = (document: HostBusinessDocument) => {
    setEditingDocumentId(document.id);
    setFormError("");
    setDrafts((current) => ({
      ...current,
      [document.id]: {
        title: document.title,
        documentType: document.documentType,
        note: document.note,
        issuedAt: document.issuedAt ?? "",
        expiresAt: document.expiresAt ?? "",
        isActive: document.isActive,
      },
    }));
  };

  return (
    <div className="space-y-3">
      {documents.map((document) => {
        const isEditing = editingDocumentId === document.id;
        const draft = editableDrafts[document.id] ?? {
          title: document.title,
          documentType: document.documentType,
          note: document.note,
          issuedAt: document.issuedAt ?? "",
          expiresAt: document.expiresAt ?? "",
          isActive: document.isActive,
        };

        return (
          <div
            key={document.id || `${document.fileName}-${document.fileUrl}`}
            className="rounded-[20px] border border-border-light bg-white/85 px-4 py-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-text-primary">
                  {document.title || document.fileName || "Business document"}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-text-secondary">
                  {getBusinessDocumentTypeLabel(document.documentType)}
                </p>
                {document.note ? (
                  <p className="mt-2 text-[13px] leading-6 text-text-secondary">{document.note}</p>
                ) : null}
                {formatTimestamp(document.updatedAt || document.createdAt) ? (
                  <p className="mt-2 text-[12px] uppercase tracking-[0.16em] text-text-secondary">
                    Saved {formatTimestamp(document.updatedAt || document.createdAt)}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {document.fileUrl ? (
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Open file
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => startEditing(document)}
                  disabled={disabled}
                  className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(document.id)}
                  disabled={disabled || deletingDocumentId === document.id}
                  className="inline-flex items-center justify-center rounded-[16px] border border-red-200 bg-red-50/80 px-4 py-2.5 text-[13px] font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {deletingDocumentId === document.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-4 rounded-[18px] border border-border bg-surface px-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">
                      Title
                    </span>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [document.id]: {
                            ...draft,
                            title: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-[16px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-text-primary/20"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-[13px] font-semibold text-text-primary">
                      Document type
                    </span>
                    <select
                      value={draft.documentType}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [document.id]: {
                            ...draft,
                            documentType: event.target.value as BusinessDocumentType,
                          },
                        }))
                      }
                      className="w-full rounded-[16px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-text-primary/20"
                    >
                      {businessDocumentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-[13px] font-semibold text-text-primary">Note</span>
                  <textarea
                    value={draft.note}
                    rows={3}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [document.id]: {
                          ...draft,
                          note: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-[16px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-all duration-200 focus:border-text-primary/20"
                  />
                </label>

                {formError ? (
                  <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50/80 px-4 py-3 text-[13px] leading-6 text-red-700">
                    {formError}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setFormError("");
                      try {
                        await onSave(document.id, draft);
                        setEditingDocumentId("");
                      } catch (error) {
                        setFormError(
                          error instanceof Error
                            ? error.message || "We couldn't save this document right now."
                            : "We couldn't save this document right now.",
                        );
                      }
                    }}
                    disabled={disabled || savingDocumentId === document.id}
                    className="inline-flex items-center justify-center rounded-[16px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
                  >
                    {savingDocumentId === document.id ? "Saving..." : "Save document"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDocumentId("");
                      setFormError("");
                    }}
                    className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
