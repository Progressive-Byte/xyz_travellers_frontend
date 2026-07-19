"use client";

import React from "react";
import { type HostPayoutMethod, type HostPayoutProfile } from "@/lib/host";

type HostPayoutFormErrors = Partial<Record<keyof HostPayoutProfile | "form", string>>;

type HostPayoutFormProps = {
  values: HostPayoutProfile;
  errors: HostPayoutFormErrors;
  isSubmitting: boolean;
  successMessage: string;
  onChange: (field: keyof HostPayoutProfile, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "w-full rounded-[22px] border border-border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const payoutMethodOptions: Array<{ value: HostPayoutMethod; label: string }> = [
  { value: "", label: "Select payout method" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "mobile_wallet", label: "Mobile wallet" },
];

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  error?: string;
}> = ({ label, value, onChange, type = "text", placeholder, error }) => (
  <label className="block">
    <span className="mb-2 block text-[13px] font-semibold text-text-primary">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${inputClassName} ${error ? "border-red-300 focus:border-red-400" : ""}`}
    />
    {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
  </label>
);

export const HostPayoutForm: React.FC<HostPayoutFormProps> = ({
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
            Payout readiness
          </p>
          <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Payout details
          </h2>
        </div>
        <span className="rounded-full bg-primary-light px-3 py-2 text-[12px] font-semibold text-text-primary">
          Setup only
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Account holder name"
          value={values.accountHolderName}
          onChange={(value) => onChange("accountHolderName", value)}
          placeholder="John Doe"
          error={errors.accountHolderName}
        />

        <label className="block">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">Payout method</span>
          <select
            value={values.payoutMethod}
            onChange={(event) => onChange("payoutMethod", event.target.value)}
            className={`${inputClassName} ${errors.payoutMethod ? "border-red-300 focus:border-red-400" : ""}`}
          >
            {payoutMethodOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.payoutMethod ? <p className="mt-2 text-[13px] text-red-600">{errors.payoutMethod}</p> : null}
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Billing address"
          value={values.billingAddress}
          onChange={(value) => onChange("billingAddress", value)}
          placeholder="House, area, city"
          error={errors.billingAddress}
        />
        <Field
          label="Country"
          value={values.country}
          onChange={(value) => onChange("country", value)}
          placeholder="Bangladesh"
          error={errors.country}
        />
      </div>

      <div className="mt-4">
        <Field
          label="Currency"
          value={values.currency}
          onChange={(value) => onChange("currency", value)}
          placeholder="BDT"
          error={errors.currency}
        />
      </div>

      {values.payoutMethod === "bank_transfer" ? (
        <div className="mt-6 rounded-[24px] border border-border-light bg-surface px-4 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Bank transfer
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Bank name"
              value={values.bankName}
              onChange={(value) => onChange("bankName", value)}
              placeholder="ABC Bank"
              error={errors.bankName}
            />
            <Field
              label="Branch name"
              value={values.branchName}
              onChange={(value) => onChange("branchName", value)}
              placeholder="Dhaka Main Branch"
              error={errors.branchName}
            />
            <Field
              label="Account number"
              value={values.accountNumber}
              onChange={(value) => onChange("accountNumber", value)}
              placeholder="1234567890"
              error={errors.accountNumber}
            />
            <Field
              label="Routing number"
              value={values.routingNumber}
              onChange={(value) => onChange("routingNumber", value)}
              placeholder="021234567"
              error={errors.routingNumber}
            />
            <div className="sm:col-span-2">
              <Field
                label="SWIFT code"
                value={values.swiftCode}
                onChange={(value) => onChange("swiftCode", value)}
                placeholder="ABCD1234"
                error={errors.swiftCode}
              />
            </div>
          </div>
        </div>
      ) : null}

      {values.payoutMethod === "mobile_wallet" ? (
        <div className="mt-6 rounded-[24px] border border-border-light bg-surface px-4 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Mobile wallet
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Wallet provider"
              value={values.walletProvider}
              onChange={(value) => onChange("walletProvider", value)}
              placeholder="bKash"
              error={errors.walletProvider}
            />
            <Field
              label="Wallet number"
              value={values.walletNumber}
              onChange={(value) => onChange("walletNumber", value)}
              placeholder="+8801XXXXXXXXX"
              error={errors.walletNumber}
            />
          </div>
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
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {isSubmitting ? "Saving payout details..." : "Save payout setup"}
        </button>
      </div>
    </form>
  );
};
