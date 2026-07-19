"use client";

import React from "react";
import { HostBusinessCard } from "@/components/host/businesses/HostBusinessCard";
import { type HostBusiness } from "@/lib/host";

type HostBusinessesListProps = {
  businesses: HostBusiness[];
  selectedBusinessId: string;
  deletingBusinessId: string;
  onSelect: (businessId: string) => void;
  onEdit: (businessId: string) => void;
  onDelete: (businessId: string) => void;
};

export const HostBusinessesList: React.FC<HostBusinessesListProps> = ({
  businesses,
  selectedBusinessId,
  deletingBusinessId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="surface-card rounded-panel p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
        Saved businesses
      </p>
      <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
        Reusable commercial profiles
      </h2>
      <p className="mt-4 text-[14px] leading-7 text-text-secondary">
        Select one business to manage its reusable document library, or update the record details
        here before linking it to a commercial property.
      </p>

      {businesses.length === 0 ? (
        <div className="mt-6 rounded-[22px] border border-border-light bg-white/80 px-5 py-5 text-[14px] leading-7 text-text-secondary">
          No businesses have been created yet. Start with one business profile so commercial
          properties can reuse the same identity and document library later.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {businesses.map((business) => (
            <HostBusinessCard
              key={business.id}
              business={business}
              isSelected={selectedBusinessId === business.id}
              isDeleting={deletingBusinessId === business.id}
              onSelect={() => onSelect(business.id)}
              onEdit={() => onEdit(business.id)}
              onDelete={() => onDelete(business.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
