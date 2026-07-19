"use client";

import React from "react";
import { type HostUnitPricing } from "@/lib/host";

type HostPropertyPricingFormErrors = Partial<
  Record<keyof Pick<HostUnitPricing, "basePrice" | "discountedPrice" | "currency"> | "form", string>
>;

type HostPropertyPricingFormProps = {
  values: HostUnitPricing;
  errors: HostPropertyPricingFormErrors;
  successMessage: string;
  isSubmitting: boolean;
  disabled?: boolean;
  onChange: (field: keyof Pick<HostUnitPricing, "basePrice" | "discountedPrice" | "currency">, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

export const HostPropertyPricingForm: React.FC<HostPropertyPricingFormProps> = ({
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
            Step 5
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Unit pricing
          </h2>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
          Rate setup
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Base price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.basePrice}
            onChange={(event) => onChange("basePrice", event.target.value)}
            placeholder="5000"
            disabled={disabled}
            className={`${inputClassName} ${errors.basePrice ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.basePrice ? <p className="mt-2 text-[13px] text-red-600">{errors.basePrice}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Discounted price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.discountedPrice}
            onChange={(event) => onChange("discountedPrice", event.target.value)}
            placeholder="4500"
            disabled={disabled}
            className={`${inputClassName} ${errors.discountedPrice ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.discountedPrice ? (
            <p className="mt-2 text-[13px] text-red-600">{errors.discountedPrice}</p>
          ) : null}
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Currency</span>
          <input
            type="text"
            value={values.currency}
            onChange={(event) => onChange("currency", event.target.value.toUpperCase())}
            placeholder="BDT"
            disabled={disabled}
            className={`${inputClassName} ${errors.currency ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.currency ? <p className="mt-2 text-[13px] text-red-600">{errors.currency}</p> : null}
        </label>
      </div>

      {values.note ? (
        <div className="mt-5 rounded-[22px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
          {values.note}
        </div>
      ) : null}

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
          {isSubmitting ? "Saving pricing..." : "Save pricing"}
        </button>
      </div>
    </form>
  );
};
