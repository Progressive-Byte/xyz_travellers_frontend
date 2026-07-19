"use client";

import React from "react";
import { type BusinessDocumentType } from "@/components/host/businesses/documents/businessDocumentTypes";
import { HostBusinessDocumentUploader } from "@/components/host/businesses/documents/HostBusinessDocumentUploader";
import { HostBusinessDocumentsList } from "@/components/host/businesses/documents/HostBusinessDocumentsList";
import {
  type HostBusiness,
  type HostBusinessDocument,
  type UpdateHostBusinessDocumentPayload,
} from "@/lib/host";

type HostBusinessDocumentsPanelProps = {
  business: HostBusiness | null;
  documents: HostBusinessDocument[];
  isLoading: boolean;
  isUploading: boolean;
  savingDocumentId: string;
  deletingDocumentId: string;
  error: string;
  disabled?: boolean;
  onUpload: (
    files: File[],
    metadata: { title: string; documentType: BusinessDocumentType; note: string },
  ) => Promise<void>;
  onSaveDocument: (
    documentId: string,
    payload: UpdateHostBusinessDocumentPayload,
  ) => Promise<void>;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onRetry: () => void;
};

export const HostBusinessDocumentsPanel: React.FC<HostBusinessDocumentsPanelProps> = ({
  business,
  documents,
  isLoading,
  isUploading,
  savingDocumentId,
  deletingDocumentId,
  error,
  disabled = false,
  onUpload,
  onSaveDocument,
  onDeleteDocument,
  onRetry,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Document library
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        {business ? `Documents for ${business.name}` : "Choose a business to manage its documents"}
      </h2>
      {business?.contactName || business?.contactEmail ? (
        <p className="mt-3 text-[13px] text-text-secondary">
          {[business?.contactName, business?.contactEmail].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        These files are reusable business-level proof. Commercial properties can link back to this
        library from the property editor, while property verification stays separate in the listing workflow.
      </p>

      {!business ? (
        <div className="mt-6 rounded-[22px] border border-border-light bg-white/80 px-5 py-5 text-[14px] leading-7 text-text-secondary">
          Select a business profile first to open its reusable document library.
        </div>
      ) : isLoading ? (
        <div className="mt-6 rounded-[22px] border border-border-light bg-white/80 px-5 py-6">
          <div className="h-28 animate-pulse rounded-[18px] bg-surface" />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <HostBusinessDocumentUploader
            disabled={disabled}
            isUploading={isUploading}
            onUpload={onUpload}
          />

          {error ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50/80 px-4 py-4">
              <p className="text-[14px] leading-6 text-red-700">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex items-center justify-center rounded-[16px] border border-red-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                Retry documents
              </button>
            </div>
          ) : null}

          {documents.length === 0 ? (
            <div className="rounded-[18px] border border-border-light bg-white/80 px-4 py-4 text-[14px] leading-7 text-text-secondary">
              No reusable business documents are saved yet for this business.
            </div>
          ) : (
            <HostBusinessDocumentsList
              documents={documents}
              disabled={disabled}
              savingDocumentId={savingDocumentId}
              deletingDocumentId={deletingDocumentId}
              onSave={onSaveDocument}
              onDelete={onDeleteDocument}
            />
          )}
        </div>
      )}
    </div>
  );
};
