"use client";

import React from "react";
import { type UpsertHostBusinessPayload } from "@/lib/host";

type HostBusinessFormErrors = Partial<Record<keyof UpsertHostBusinessPayload | "form", string>>;

type HostBusinessFormProps = {
  values: UpsertHostBusinessPayload;
  errors: HostBusinessFormErrors;
  successMessage: string;
  isSubmitting: boolean;
  disabled?: boolean;
  mode: "create" | "edit";
  onChange: (field: keyof UpsertHostBusinessPayload, value: string) => void;
  onCancel?: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium disabled:cursor-not-allowed disabled:opacity-70";

export const HostBusinessForm: React.FC<HostBusinessFormProps> = ({
  values,
  errors,
  successMessage,
  isSubmitting,
  disabled = false,
  mode,
  onChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <form className="surface-card rounded-panel p-6 md:p-7" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Business profile
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            {mode === "create" ? "Create a reusable business record" : "Update this business profile"}
          </h2>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
          {mode === "create" ? "New business" : "Editing"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Business name</span>
          <input
            type="text"
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            disabled={disabled}
            placeholder="Example: XYZ Travellers Hospitality Ltd."
            className={`${inputClassName} ${errors.name ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.name ? <p className="mt-2 text-[13px] text-red-600">{errors.name}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">
            Registration number
          </span>
          <input
            type="text"
            value={values.registrationNumber}
            onChange={(event) => onChange("registrationNumber", event.target.value)}
            disabled={disabled}
            placeholder="Trade license or registration number"
            className={`${inputClassName} ${errors.registrationNumber ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.registrationNumber ? (
            <p className="mt-2 text-[13px] text-red-600">{errors.registrationNumber}</p>
          ) : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Country</span>
          <input
            type="text"
            value={values.country}
            onChange={(event) => onChange("country", event.target.value)}
            disabled={disabled}
            placeholder="Business country"
            className={`${inputClassName} ${errors.country ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.country ? <p className="mt-2 text-[13px] text-red-600">{errors.country}</p> : null}
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Address</span>
        <textarea
          value={values.address}
          onChange={(event) => onChange("address", event.target.value)}
          rows={4}
          disabled={disabled}
          placeholder="Registered business address"
          className={`${inputClassName} min-h-[120px] resize-y ${errors.address ? "border-red-300 focus:border-red-400" : ""}`}
        />
        {errors.address ? <p className="mt-2 text-[13px] text-red-600">{errors.address}</p> : null}
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Internal note</span>
        <textarea
          value={values.note}
          onChange={(event) => onChange("note", event.target.value)}
          rows={4}
          disabled={disabled}
          placeholder="Optional note about this business profile or its reusable documents."
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
          {isSubmitting
            ? mode === "create"
              ? "Creating business..."
              : "Saving business..."
            : mode === "create"
              ? "Create business"
              : "Save business"}
        </button>

        {mode === "edit" && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled || isSubmitting}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
    </form>
  );
};
