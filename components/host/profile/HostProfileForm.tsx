"use client";

import React from "react";
import { type HostProfile } from "@/lib/host";

type HostProfileFormErrors = Partial<
  Record<keyof Pick<HostProfile, "firstName" | "lastName" | "phone" | "address" | "profilePhoto" | "bio"> | "form", string>
>;

type HostProfileFormProps = {
  values: HostProfile;
  errors: HostProfileFormErrors;
  isSubmitting: boolean;
  successMessage: string;
  onChange: (field: keyof HostProfile, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}> = ({ label, value, onChange, type = "text", placeholder, error, readOnly = false }) => (
  <label className="block">
    <span className="mb-2 block text-[13px] font-semibold text-text-primary">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`${inputClassName} ${error ? "border-red-300 focus:border-red-400" : ""} ${
        readOnly ? "bg-surface text-text-secondary" : ""
      }`}
    />
    {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
  </label>
);

export const HostProfileForm: React.FC<HostProfileFormProps> = ({
  values,
  errors,
  isSubmitting,
  successMessage,
  onChange,
  onSubmit,
}) => {
  return (
    <form className="surface-card rounded-panel p-6 md:p-7" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Host identity
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Profile details
          </h2>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
          Approved host
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          value={values.firstName}
          onChange={(value) => onChange("firstName", value)}
          placeholder="John"
          error={errors.firstName}
        />
        <Field
          label="Last name"
          value={values.lastName}
          onChange={(value) => onChange("lastName", value)}
          placeholder="Doe"
          error={errors.lastName}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          value={values.email}
          onChange={() => undefined}
          type="email"
          readOnly
          placeholder="john@example.com"
        />
        <Field
          label="Phone"
          value={values.phone}
          onChange={(value) => onChange("phone", value)}
          type="tel"
          placeholder="+8801XXXXXXXXX"
          error={errors.phone}
        />
      </div>

      <div className="mt-4">
        <Field
          label="Address"
          value={values.address}
          onChange={(value) => onChange("address", value)}
          placeholder="House, area, city"
          error={errors.address}
        />
      </div>

      <div className="mt-4">
        <Field
          label="Profile photo URL"
          value={values.profilePhoto}
          onChange={(value) => onChange("profilePhoto", value)}
          type="url"
          placeholder="https://example.com/host-photo.jpg"
          error={errors.profilePhoto}
        />
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-semibold text-text-primary">Bio</span>
        <textarea
          value={values.bio}
          onChange={(event) => onChange("bio", event.target.value)}
          rows={6}
          placeholder="Tell guests a little about your hosting style and experience."
          className={`${inputClassName} min-h-[160px] resize-y ${errors.bio ? "border-red-300 focus:border-red-400" : ""}`}
        />
        {errors.bio ? <p className="mt-2 text-[13px] text-red-600">{errors.bio}</p> : null}
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
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {isSubmitting ? "Saving profile..." : "Save profile"}
        </button>
      </div>
    </form>
  );
};
