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
  onChange: (field: keyof UpsertHostBusinessPayload, value: string | boolean) => void;
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
            value={values.businessName}
            onChange={(event) => onChange("businessName", event.target.value)}
            disabled={disabled}
            placeholder="Example: XYZ Travellers Hospitality Ltd."
            className={`${inputClassName} ${errors.businessName ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.businessName ? <p className="mt-2 text-[13px] text-red-600">{errors.businessName}</p> : null}
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
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Tax/VAT number</span>
          <input
            type="text"
            value={values.taxVatNumber}
            onChange={(event) => onChange("taxVatNumber", event.target.value)}
            disabled={disabled}
            placeholder="Optional tax or VAT number"
            className={`${inputClassName} ${errors.taxVatNumber ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.taxVatNumber ? <p className="mt-2 text-[13px] text-red-600">{errors.taxVatNumber}</p> : null}
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Business address</span>
          <textarea
            value={values.businessAddress}
            onChange={(event) => onChange("businessAddress", event.target.value)}
            rows={4}
            disabled={disabled}
            placeholder="Registered business address"
            className={`${inputClassName} min-h-[120px] resize-y ${errors.businessAddress ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.businessAddress ? <p className="mt-2 text-[13px] text-red-600">{errors.businessAddress}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Contact name</span>
          <input
            type="text"
            value={values.contactName}
            onChange={(event) => onChange("contactName", event.target.value)}
            disabled={disabled}
            placeholder="Primary business contact"
            className={`${inputClassName} ${errors.contactName ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.contactName ? <p className="mt-2 text-[13px] text-red-600">{errors.contactName}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Contact email</span>
          <input
            type="email"
            value={values.contactEmail}
            onChange={(event) => onChange("contactEmail", event.target.value)}
            disabled={disabled}
            placeholder="business@example.com"
            className={`${inputClassName} ${errors.contactEmail ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.contactEmail ? <p className="mt-2 text-[13px] text-red-600">{errors.contactEmail}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Contact phone</span>
          <input
            type="text"
            value={values.contactPhone}
            onChange={(event) => onChange("contactPhone", event.target.value)}
            disabled={disabled}
            placeholder="+8801700000000"
            className={`${inputClassName} ${errors.contactPhone ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.contactPhone ? <p className="mt-2 text-[13px] text-red-600">{errors.contactPhone}</p> : null}
        </label>

        <label className="flex items-center gap-3 rounded-[22px] border border-border bg-card px-4 py-3.5 shadow-soft sm:col-span-2">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => onChange("isActive", event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-border text-text-primary"
          />
          <div>
            <span className="block text-[13px] font-semibold text-text-primary">Active business</span>
            <span className="text-[12px] text-text-secondary">
              Keep this business available for future commercial property linkage.
            </span>
          </div>
        </label>
      </div>

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
