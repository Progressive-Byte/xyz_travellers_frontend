"use client";

import Link from "next/link";
import React from "react";
import { type HostBusiness } from "@/lib/host";

type HostPropertyBusinessSelectorProps = {
  ownershipType: string;
  businesses: HostBusiness[];
  value: string;
  disabled: boolean;
  error?: string;
  onChange: (businessId: string) => void;
};

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:border-text-primary/20 disabled:opacity-70";

export const HostPropertyBusinessSelector: React.FC<HostPropertyBusinessSelectorProps> = ({
  ownershipType,
  businesses,
  value,
  disabled,
  error,
  onChange,
}) => {
  if (ownershipType.trim().toLowerCase() !== "commercial") {
    return null;
  }

  return (
    <div className="rounded-[22px] border border-border-light bg-white/85 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        Commercial ownership
      </p>
      <h3 className="mt-3 text-[18px] font-semibold text-text-primary">
        Link this property to a business profile
      </h3>
      <p className="mt-3 text-[14px] leading-6 text-text-secondary">
        Commercial listings should point to one reusable business record before review. Create the
        business once, then reuse it across commercial properties.
      </p>

      {businesses.length === 0 ? (
        <div className="mt-4 rounded-[18px] border border-border-light bg-surface px-4 py-4 text-[14px] leading-6 text-text-secondary">
          No business profiles are available yet.
          <Link href="/host/businesses" className="ml-1 font-semibold text-text-primary underline">
            Open businesses
          </Link>
          <span> to create one before final commercial submission.</span>
        </div>
      ) : (
        <label className="mt-4 block">
          <span className="mb-2 block text-[13px] font-semibold text-text-primary">
            Selected business
          </span>
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className={`${inputClassName} ${error ? "border-red-300 focus:border-red-400" : ""}`}
          >
            <option value="">Select business profile</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
        </label>
      )}
    </div>
  );
};
