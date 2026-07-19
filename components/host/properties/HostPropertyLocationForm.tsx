"use client";

import React from "react";
import { type HostPropertyDetail } from "@/lib/host";

type HostPropertyLocationFormErrors = Partial<
  Record<keyof Pick<HostPropertyDetail, "address" | "city" | "country" | "lat" | "lng" | "houseRules"> | "form", string>
>;

type HostPropertyLocationFormProps = {
  values: HostPropertyDetail;
  errors: HostPropertyLocationFormErrors;
  isSubmitting: boolean;
  successMessage: string;
  disabled?: boolean;
  submitLabel?: string;
  onChange: (field: keyof HostPropertyDetail, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, error, disabled = false }) => (
  <label className="block">
    <span className="mb-2 block text-[13px] font-semibold text-text-primary">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputClassName} ${error ? "border-red-300 focus:border-red-400" : ""}`}
    />
    {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
  </label>
);

export const HostPropertyLocationForm: React.FC<HostPropertyLocationFormProps> = ({
  values,
  errors,
  isSubmitting,
  successMessage,
  disabled = false,
  submitLabel = "Save location",
  onChange,
  onSubmit,
}) => {
  return (
    <form className="surface-card rounded-panel p-6 md:p-7" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Step 2
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Location and rules
          </h2>
        </div>
        <span className="rounded-full border border-border-light bg-card px-3 py-2 text-[12px] font-semibold text-text-primary">
          Early access
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field
            label="Address"
            value={values.address}
            onChange={(value) => onChange("address", value)}
            placeholder="House, road, district"
            error={errors.address}
            disabled={disabled}
          />
        </div>

        <Field
          label="City"
          value={values.city}
          onChange={(value) => onChange("city", value)}
          placeholder="Dhaka"
          error={errors.city}
          disabled={disabled}
        />
        <Field
          label="Country"
          value={values.country}
          onChange={(value) => onChange("country", value)}
          placeholder="Bangladesh"
          error={errors.country}
          disabled={disabled}
        />

        <Field
          label="Latitude"
          value={values.lat}
          onChange={(value) => onChange("lat", value)}
          placeholder="23.8103"
          error={errors.lat}
          disabled={disabled}
        />
        <Field
          label="Longitude"
          value={values.lng}
          onChange={(value) => onChange("lng", value)}
          placeholder="90.4125"
          error={errors.lng}
          disabled={disabled}
        />
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">House rules</span>
        <textarea
          value={values.houseRules}
          onChange={(event) => onChange("houseRules", event.target.value)}
          rows={5}
          disabled={disabled}
          placeholder="Share the first rules guests should know before booking."
          className={`${inputClassName} min-h-[150px] resize-y ${errors.houseRules ? "border-red-300 focus:border-red-400" : ""}`}
        />
        {errors.houseRules ? <p className="mt-2 text-[13px] text-red-600">{errors.houseRules}</p> : null}
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
          {isSubmitting ? "Saving location..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
