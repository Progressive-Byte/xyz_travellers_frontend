"use client";

import React from "react";
import {
  type HostPropertyReferenceOption,
  type UpsertHostPropertyUnitPayload,
} from "@/lib/host";

type HostPropertyUnitFormErrors = Partial<
  Record<keyof Pick<UpsertHostPropertyUnitPayload, "name" | "capacity" | "bedrooms" | "bathrooms" | "beds"> | "form", string>
>;

type HostPropertyUnitFormProps = {
  values: UpsertHostPropertyUnitPayload;
  amenities: HostPropertyReferenceOption[];
  errors: HostPropertyUnitFormErrors;
  successMessage: string;
  isSubmitting: boolean;
  disabled?: boolean;
  mode: "create" | "edit";
  onChange: (field: keyof UpsertHostPropertyUnitPayload, value: string | string[] | boolean) => void;
  onCancel?: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

export const HostPropertyUnitForm: React.FC<HostPropertyUnitFormProps> = ({
  values,
  amenities,
  errors,
  successMessage,
  isSubmitting,
  disabled = false,
  mode,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const toggleAmenity = (value: string) => {
    const nextAmenities = values.amenities.includes(value)
      ? values.amenities.filter((item) => item !== value)
      : [...values.amenities, value];

    onChange("amenities", nextAmenities);
  };

  return (
    <form className="surface-card rounded-panel p-6 md:p-7" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Step 4
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            {mode === "edit" ? "Edit unit" : "Create a unit"}
          </h2>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
          Inventory setup
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Unit name</span>
          <input
            type="text"
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Deluxe room, family suite, or similar"
            disabled={disabled}
            className={`${inputClassName} ${errors.name ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.name ? <p className="mt-2 text-[13px] text-red-600">{errors.name}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Guest capacity</span>
          <input
            type="number"
            min="1"
            value={values.capacity}
            onChange={(event) => onChange("capacity", event.target.value)}
            placeholder="2"
            disabled={disabled}
            className={`${inputClassName} ${errors.capacity ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.capacity ? <p className="mt-2 text-[13px] text-red-600">{errors.capacity}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Beds</span>
          <input
            type="number"
            min="0"
            value={values.beds}
            onChange={(event) => onChange("beds", event.target.value)}
            placeholder="1"
            disabled={disabled}
            className={`${inputClassName} ${errors.beds ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.beds ? <p className="mt-2 text-[13px] text-red-600">{errors.beds}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Bedrooms</span>
          <input
            type="number"
            min="0"
            value={values.bedrooms}
            onChange={(event) => onChange("bedrooms", event.target.value)}
            placeholder="1"
            disabled={disabled}
            className={`${inputClassName} ${errors.bedrooms ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.bedrooms ? <p className="mt-2 text-[13px] text-red-600">{errors.bedrooms}</p> : null}
        </label>

        <label>
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Bathrooms</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={values.bathrooms}
            onChange={(event) => onChange("bathrooms", event.target.value)}
            placeholder="1"
            disabled={disabled}
            className={`${inputClassName} ${errors.bathrooms ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {errors.bathrooms ? <p className="mt-2 text-[13px] text-red-600">{errors.bathrooms}</p> : null}
        </label>
      </div>

      <div className="mt-5 rounded-[22px] border border-border-light bg-white/80 px-4 py-4">
        <label className={`flex items-center gap-3 text-[14px] font-semibold text-text-primary ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}>
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => onChange("isActive", event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-border-light text-primary"
          />
          Keep this unit active for later pricing and availability setup
        </label>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Unit amenities</span>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {amenities.map((option) => {
            const checked = values.amenities.includes(option.value);

            return (
              <label
                key={option.id || option.value}
                className={`flex items-start gap-3 rounded-[20px] border px-4 py-3 text-[14px] leading-6 transition-all ${
                  checked
                    ? "border-primary/35 bg-primary-light/80 text-text-primary"
                    : "border-border-light bg-white/80 text-text-primary"
                } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleAmenity(option.value)}
                  className="mt-1 h-4 w-4 rounded border-border-light text-primary"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
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
            ? mode === "edit"
              ? "Saving unit..."
              : "Creating unit..."
            : mode === "edit"
              ? "Save unit"
              : "Create unit"}
        </button>

        {mode === "edit" && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:opacity-70"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
    </form>
  );
};
