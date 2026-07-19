"use client";

import React from "react";
import { type BlockHostUnitDatesPayload } from "@/lib/host";

type HostPropertyBlockDatesErrors = Partial<Record<keyof BlockHostUnitDatesPayload | "form", string>>;

type HostPropertyBlockDatesFormProps = {
  values: BlockHostUnitDatesPayload;
  errors: HostPropertyBlockDatesErrors;
  successMessage: string;
  isSubmitting: boolean;
  disabled?: boolean;
  onChange: (field: keyof BlockHostUnitDatesPayload, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

export const HostPropertyBlockDatesForm: React.FC<HostPropertyBlockDatesFormProps> = ({
  values,
  errors,
  successMessage,
  isSubmitting,
  disabled = false,
  onChange,
  onSubmit,
}) => {
  return (
    <form className="surface-card rounded-panel p-6 md:p-7" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Block dates
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Restrict availability intentionally
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Start date</span>
          <input
            type="date"
            value={values.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            disabled={disabled}
            className={`${inputClassName} ${errors.startDate ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.startDate ? <p className="mt-2 text-[13px] text-red-600">{errors.startDate}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">End date</span>
          <input
            type="date"
            value={values.endDate}
            onChange={(event) => onChange("endDate", event.target.value)}
            disabled={disabled}
            className={`${inputClassName} ${errors.endDate ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.endDate ? <p className="mt-2 text-[13px] text-red-600">{errors.endDate}</p> : null}
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Note</span>
        <textarea
          rows={4}
          value={values.note}
          onChange={(event) => onChange("note", event.target.value)}
          placeholder="Optional reason for blocking these dates"
          disabled={disabled}
          className={`${inputClassName} min-h-[120px] resize-y ${errors.note ? "border-red-300 focus:border-red-400" : ""}`}
        />
        {errors.note ? <p className="mt-2 text-[13px] text-red-600">{errors.note}</p> : null}
      </label>

      {errors.form ? (
        <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
          {errors.form}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-5 rounded-[22px] border border-primary/35 bg-primary-light/80 px-4 py-4 text-[14px] leading-6 text-text-primary">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {isSubmitting ? "Updating dates..." : "Block dates"}
        </button>
      </div>
    </form>
  );
};
