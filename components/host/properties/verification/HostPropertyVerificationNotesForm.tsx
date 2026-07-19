"use client";

import React from "react";

type HostPropertyVerificationNotesFormProps = {
  value: string;
  error?: string;
  successMessage: string;
  disabled: boolean;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const textareaClassName =
  "w-full rounded-[20px] border border-border bg-white px-4 py-3 text-[14px] leading-7 text-text-primary outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-text-primary/20 focus:bg-card disabled:cursor-not-allowed disabled:opacity-70";

export const HostPropertyVerificationNotesForm: React.FC<HostPropertyVerificationNotesFormProps> = ({
  value,
  error,
  successMessage,
  disabled,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Supporting note
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        Add context for the review team
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        Keep this practical. Mention what the documents prove or anything that will help review the
        property faster.
      </p>

      <label className="mt-6 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">
          Verification note
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          disabled={disabled || isSubmitting}
          placeholder="Example: The attached files include the ownership certificate and a recent utility bill for this property."
          className={`${textareaClassName} min-h-[160px] resize-y ${error ? "border-red-300 focus:border-red-400" : ""}`}
        />
      </label>

      {error ? (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-5 rounded-[20px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-6">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {isSubmitting ? "Saving note..." : "Save verification note"}
        </button>
      </div>
    </form>
  );
};
