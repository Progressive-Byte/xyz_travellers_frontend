"use client";

import Link from "next/link";
import React from "react";
import type { HostIdentityVerificationDocument, HostIdentityVerificationStatus } from "@/lib/host";

type HostOnboardingWorkspaceProps = {
  documents: HostIdentityVerificationDocument[];
  status: HostIdentityVerificationStatus | null;
  rejectionReason?: string | null;
  formError: string;
  saveError: string;
  saveSuccess: string;
  submitError: string;
  isSaving: boolean;
  isSubmitting: boolean;
  onDocumentChange: (
    index: number,
    field: keyof HostIdentityVerificationDocument,
    value: string,
  ) => void;
  onAddDocument: () => void;
  onRemoveDocument: (index: number) => void;
  onSaveDraft: () => Promise<void>;
  onSubmitApplication: () => Promise<void>;
  onRefresh: () => void;
};

const documentTypeOptions = [
  { value: "passport", label: "Passport" },
  { value: "nid", label: "National ID" },
  { value: "driving_license", label: "Driving license" },
  { value: "trade_license", label: "Trade license" },
  { value: "other", label: "Other document" },
];

const DocumentField: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}> = ({ label, value, placeholder, onChange }) => (
  <label className="block">
    <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
      {label}
    </span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 placeholder:text-text-secondary focus:border-text-primary/25"
    />
  </label>
);

export const HostOnboardingWorkspace: React.FC<HostOnboardingWorkspaceProps> = ({
  documents,
  status,
  rejectionReason,
  formError,
  saveError,
  saveSuccess,
  submitError,
  isSaving,
  isSubmitting,
  onDocumentChange,
  onAddDocument,
  onRemoveDocument,
  onSaveDraft,
  onSubmitApplication,
  onRefresh,
}) => {
  const statusLabel = status?.rawStatus || "Draft not submitted";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="space-y-6">
        <div className="surface-card rounded-panel p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Identity verification
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Build your host application draft
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
            Add one or more identity documents as URL-based records, save the draft, then submit the
            host request when everything is ready for admin review.
          </p>

          {rejectionReason ? (
            <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Rejection reason
              </p>
              <p className="mt-2 text-[14px] leading-6 text-text-primary">{rejectionReason}</p>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {documents.map((document, index) => (
              <div
                key={`${index}-${document.documentType}-${document.documentFront}-${document.documentBack}`}
                className="rounded-[24px] border border-border-light bg-white/85 px-5 py-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      Document {index + 1}
                    </p>
                    <p className="mt-2 text-[16px] font-semibold text-text-primary">
                      {document.documentType
                        ? documentTypeOptions.find((item) => item.value === document.documentType)?.label ||
                          document.documentType
                        : "Choose document type"}
                    </p>
                  </div>

                  {documents.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => onRemoveDocument(index)}
                      className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white px-3 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4">
                  <label className="block">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      Document type
                    </span>
                    <select
                      value={document.documentType}
                      onChange={(event) =>
                        onDocumentChange(index, "documentType", event.target.value)
                      }
                      className="mt-2 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors duration-200 focus:border-text-primary/25"
                    >
                      <option value="">Choose type</option>
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <DocumentField
                    label="Front document URL"
                    value={document.documentFront}
                    placeholder="https://example.com/docs/passport-front.jpg"
                    onChange={(value) => onDocumentChange(index, "documentFront", value)}
                  />

                  <DocumentField
                    label="Back document URL"
                    value={document.documentBack}
                    placeholder="Optional unless this document has a back side"
                    onChange={(value) => onDocumentChange(index, "documentBack", value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onAddDocument}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Add another document
            </button>
          </div>

          {formError ? (
            <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {formError}
            </div>
          ) : null}

          {saveError ? (
            <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {saveError}
            </div>
          ) : null}

          {saveSuccess ? (
            <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-[14px] leading-6 text-emerald-700">
              {saveSuccess}
            </div>
          ) : null}

          {submitError ? (
            <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onSaveDraft()}
              disabled={isSaving || isSubmitting}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => void onSubmitApplication()}
              disabled={isSaving || isSubmitting}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit host request"}
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Refresh status
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="surface-card rounded-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Current status
          </p>
          <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            {statusLabel}
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-text-secondary">
            {status?.updatedAt
              ? `Last update recorded on ${new Date(status.updatedAt).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}.`
              : "No onboarding draft has been submitted yet. Save the first draft to start your application record."}
          </p>
        </div>

        <div className="surface-card rounded-panel p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Submission checklist
          </p>
          <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
            Keep the request review-ready
          </h2>
          <div className="mt-5 space-y-3">
            {[
              "Add at least one document with a valid front-side URL.",
              "Use the correct document type so the admin review stays clear.",
              "Submit only after the draft reflects the latest identity proof you want reviewed.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3 text-[14px] leading-6 text-text-primary"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
