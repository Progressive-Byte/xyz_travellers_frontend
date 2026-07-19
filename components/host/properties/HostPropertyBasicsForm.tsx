"use client";

import React from "react";
import {
  type HostPropertyDetail,
  type HostPropertyReferenceOption,
} from "@/lib/host";

type HostPropertyBasicsFormErrors = Partial<
  Record<keyof Pick<HostPropertyDetail, "name" | "description" | "propertyType" | "ownershipType"> | "form", string>
>;

type HostPropertyBasicsFormProps = {
  values: HostPropertyDetail;
  propertyTypes: HostPropertyReferenceOption[];
  errors: HostPropertyBasicsFormErrors;
  isSubmitting: boolean;
  successMessage: string;
  disabled?: boolean;
  submitLabel?: string;
  onChange: (field: keyof HostPropertyDetail, value: string | string[]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const ownershipOptions = [
  { value: "", label: "Select ownership type" },
  { value: "personal", label: "Personal" },
  { value: "commercial", label: "Commercial" },
];

export const HostPropertyBasicsForm: React.FC<HostPropertyBasicsFormProps> = ({
  values,
  propertyTypes,
  errors,
  isSubmitting,
  successMessage,
  disabled = false,
  submitLabel = "Save basics",
  onChange,
  onSubmit,
}) => {
  return (
    <form className="surface-card rounded-panel p-6 md:p-7" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Step 1
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Property basics
          </h2>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
          Draft foundation
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Property name</span>
          <input
            type="text"
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Give your property a guest-friendly title"
            disabled={disabled}
            className={`${inputClassName} ${errors.name ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.name ? <p className="mt-2 text-[13px] text-red-600">{errors.name}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Property type</span>
          <select
            value={values.propertyType}
            onChange={(event) => onChange("propertyType", event.target.value)}
            disabled={disabled}
            className={`${inputClassName} ${errors.propertyType ? "border-red-300 focus:border-red-400" : ""}`}
          >
            <option value="">Select property type</option>
            {propertyTypes.map((option) => (
              <option key={option.id || option.value} value={option.id || option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.propertyType ? <p className="mt-2 text-[13px] text-red-600">{errors.propertyType}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Ownership type</span>
          <select
            value={values.ownershipType}
            onChange={(event) => onChange("ownershipType", event.target.value)}
            disabled={disabled}
            className={`${inputClassName} ${errors.ownershipType ? "border-red-300 focus:border-red-400" : ""}`}
          >
            {ownershipOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.ownershipType ? (
            <p className="mt-2 text-[13px] text-red-600">{errors.ownershipType}</p>
          ) : null}
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={6}
          disabled={disabled}
          placeholder="Describe the stay, the atmosphere, and what makes the property special."
          className={`${inputClassName} min-h-[160px] resize-y ${errors.description ? "border-red-300 focus:border-red-400" : ""}`}
        />
        {errors.description ? <p className="mt-2 text-[13px] text-red-600">{errors.description}</p> : null}
      </label>

      {values.ownershipType === "commercial" ? (
        <div className="mt-5 rounded-[22px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
          Commercial ownership is saved here, and the reusable business-linking controls now appear
          in the editor alongside the rest of the property workflow.
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
          {isSubmitting ? "Saving basics..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
